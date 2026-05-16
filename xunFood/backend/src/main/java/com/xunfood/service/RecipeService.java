package com.xunfood.service;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xunfood.common.PageResult;
import com.xunfood.entity.*;
import com.xunfood.mapper.*;
import com.xunfood.utils.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeMapper recipeMapper;
    private final UserMapper userMapper;
    private final UserLikeMapper userLikeMapper;
    private final UserFavoriteMapper userFavoriteMapper;
    private final AiService aiService;

    public PageResult<Recipe> getRecipeList(String type, Long page, Long size) {
        Page<Recipe> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<Recipe>()
                .eq(Recipe::getStatus, 1)
                .eq(Recipe::getDeleted, 0);

        switch (type) {
            case "like":
                wrapper.orderByDesc(Recipe::getLikeCount, Recipe::getCreateTime);
                break;
            case "favorite":
                wrapper.orderByDesc(Recipe::getFavoriteCount, Recipe::getCreateTime);
                break;
            default:
                wrapper.orderByDesc(Recipe::getCreateTime);
        }

        Page<Recipe> resultPage = recipeMapper.selectPage(pageParam, wrapper);
        List<Recipe> recipes = enrichRecipes(resultPage.getRecords());

        return new PageResult<>(
                resultPage.getTotal(),
                resultPage.getPages(),
                resultPage.getCurrent(),
                resultPage.getSize(),
                recipes
        );
    }

    public Recipe getRecipeDetail(Long id) {
        Recipe recipe = recipeMapper.selectById(id);
        if (recipe == null || recipe.getDeleted() != 0) {
            return null;
        }

        recipe.setViewCount((recipe.getViewCount() != null ? recipe.getViewCount() : 0) + 1);
        recipeMapper.updateById(recipe);

        enrichRecipe(recipe);
        return recipe;
    }

    public List<Recipe.Step> startCooking(Long recipeId) {
        Recipe recipe = recipeMapper.selectById(recipeId);
        if (recipe == null) {
            throw new RuntimeException("菜谱不存在");
        }

        parseRecipeSteps(recipe);
        return aiService.splitRecipeSteps(recipe);
    }

    @Transactional
    public void toggleLike(Long recipeId) {
        Long userId = UserContext.getUserId();
        if (userId == null) throw new RuntimeException("请先登录");

        UserLike exist = userLikeMapper.selectOne(new LambdaQueryWrapper<UserLike>()
                .eq(UserLike::getUserId, userId)
                .eq(UserLike::getRecipeId, recipeId));

        Recipe recipe = recipeMapper.selectById(recipeId);
        User author = userMapper.selectById(recipe.getUserId());

        if (exist == null) {
            UserLike like = new UserLike();
            like.setUserId(userId);
            like.setRecipeId(recipeId);
            userLikeMapper.insert(like);

            recipe.setLikeCount((recipe.getLikeCount() != null ? recipe.getLikeCount() : 0) + 1);
            author.setLikeCount((author.getLikeCount() != null ? author.getLikeCount() : 0) + 1);
        } else {
            userLikeMapper.deleteById(exist.getId());

            recipe.setLikeCount(Math.max((recipe.getLikeCount() != null ? recipe.getLikeCount() : 0) - 1, 0));
            author.setLikeCount(Math.max((author.getLikeCount() != null ? author.getLikeCount() : 0) - 1, 0));
        }

        recipeMapper.updateById(recipe);
        userMapper.updateById(author);
    }

    @Transactional
    public void toggleFavorite(Long recipeId) {
        Long userId = UserContext.getUserId();
        if (userId == null) throw new RuntimeException("请先登录");

        UserFavorite exist = userFavoriteMapper.selectOne(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getRecipeId, recipeId));

        Recipe recipe = recipeMapper.selectById(recipeId);
        User author = userMapper.selectById(recipe.getUserId());

        if (exist == null) {
            UserFavorite favorite = new UserFavorite();
            favorite.setUserId(userId);
            favorite.setRecipeId(recipeId);
            userFavoriteMapper.insert(favorite);

            recipe.setFavoriteCount((recipe.getFavoriteCount() != null ? recipe.getFavoriteCount() : 0) + 1);
            author.setFavoriteCount((author.getFavoriteCount() != null ? author.getFavoriteCount() : 0) + 1);
        } else {
            userFavoriteMapper.deleteById(exist.getId());

            recipe.setFavoriteCount(Math.max((recipe.getFavoriteCount() != null ? recipe.getFavoriteCount() : 0) - 1, 0));
            author.setFavoriteCount(Math.max((author.getFavoriteCount() != null ? author.getFavoriteCount() : 0) - 1, 0));
        }

        recipeMapper.updateById(recipe);
        userMapper.updateById(author);
    }

    public List<Recipe> getMyFavorites() {
        Long userId = UserContext.getUserId();
        if (userId == null) return new ArrayList<>();

        List<UserFavorite> favorites = userFavoriteMapper.selectList(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getUserId, userId)
                .orderByDesc(UserFavorite::getCreateTime));

        List<Recipe> recipes = new ArrayList<>();
        for (UserFavorite fav : favorites) {
            Recipe recipe = recipeMapper.selectById(fav.getRecipeId());
            if (recipe != null && recipe.getDeleted() == 0) {
                enrichRecipe(recipe);
                recipes.add(recipe);
            }
        }
        return recipes;
    }

    public List<Recipe> getMyRecipes() {
        Long userId = UserContext.getUserId();
        if (userId == null) return new ArrayList<>();

        List<Recipe> recipes = recipeMapper.selectList(new LambdaQueryWrapper<Recipe>()
                .eq(Recipe::getUserId, userId)
                .eq(Recipe::getDeleted, 0)
                .orderByDesc(Recipe::getCreateTime));

        return enrichRecipes(recipes);
    }

    public List<Recipe> searchRecipes(String keyword) {
        List<Recipe> recipes = recipeMapper.selectList(new LambdaQueryWrapper<Recipe>()
                .like(Recipe::getTitle, keyword)
                .or().like(Recipe::getDescription, keyword)
                .eq(Recipe::getStatus, 1)
                .eq(Recipe::getDeleted, 0)
                .last("LIMIT 50"));

        return enrichRecipes(recipes);
    }

    private List<Recipe> enrichRecipes(List<Recipe> recipes) {
        for (Recipe recipe : recipes) {
            enrichRecipe(recipe);
        }
        return recipes;
    }

    private void enrichRecipe(Recipe recipe) {
        if (recipe.getUserId() != null) {
            User author = userMapper.selectById(recipe.getUserId());
            if (author != null) {
                author.setPassword(null);
                author.setPhone(null);
                recipe.setAuthor(author);
            }
        }

        Long userId = UserContext.getUserId();
        if (userId != null) {
            UserLike like = userLikeMapper.selectOne(new LambdaQueryWrapper<UserLike>()
                    .eq(UserLike::getUserId, userId)
                    .eq(UserLike::getRecipeId, recipe.getId()));
            recipe.setLiked(like != null);

            UserFavorite favorite = userFavoriteMapper.selectOne(new LambdaQueryWrapper<UserFavorite>()
                    .eq(UserFavorite::getUserId, userId)
                    .eq(UserFavorite::getRecipeId, recipe.getId()));
            recipe.setFavorited(favorite != null);
        }

        parseRecipeMedia(recipe);
        parseRecipeSteps(recipe);
        parseRecipeIngredients(recipe);

        if (recipe.getCover() == null || recipe.getCover().isEmpty()) {
            List<Recipe.MediaItem> mediaList = recipe.getMediaList();
            if (mediaList != null && !mediaList.isEmpty()) {
                Recipe.MediaItem first = mediaList.get(0);
                if ("video".equals(first.getType())) {
                    recipe.setCover(first.getThumbnail());
                } else {
                    recipe.setCover(first.getUrl());
                }
            }
        }
    }

    private void parseRecipeMedia(Recipe recipe) {
        if (recipe.getMedia() != null && !recipe.getMedia().isEmpty()) {
            try {
                recipe.setMediaList(JSON.parseArray(recipe.getMedia(), Recipe.MediaItem.class));
            } catch (Exception ignored) {
            }
        }
    }

    private void parseRecipeSteps(Recipe recipe) {
        if (recipe.getSteps() != null && !recipe.getSteps().isEmpty()) {
            try {
                recipe.setStepList(JSON.parseArray(recipe.getSteps(), Recipe.Step.class));
            } catch (Exception ignored) {
            }
        }
    }

    private void parseRecipeIngredients(Recipe recipe) {
        if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
            try {
                recipe.setIngredientList(JSON.parseArray(recipe.getIngredients(), Recipe.Ingredient.class));
            } catch (Exception ignored) {
            }
        }
    }

    public List<User> getLikedUsers(Long recipeId) {
        List<UserLike> likes = userLikeMapper.selectList(
                new LambdaQueryWrapper<UserLike>().eq(UserLike::getRecipeId, recipeId));
        
        List<Long> userIds = likes.stream().map(UserLike::getUserId).toList();
        if (userIds.isEmpty()) {
            return List.of();
        }
        
        List<User> users = userMapper.selectBatchIds(userIds);
        users.forEach(u -> {
            u.setPassword(null);
            u.setPhone(null);
        });
        return users;
    }

    public List<User> getFavoritedUsers(Long recipeId) {
        List<UserFavorite> favorites = userFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserFavorite>().eq(UserFavorite::getRecipeId, recipeId));
        
        List<Long> userIds = favorites.stream().map(UserFavorite::getUserId).toList();
        if (userIds.isEmpty()) {
            return List.of();
        }
        
        List<User> users = userMapper.selectBatchIds(userIds);
        users.forEach(u -> {
            u.setPassword(null);
            u.setPhone(null);
        });
        return users;
    }
}
