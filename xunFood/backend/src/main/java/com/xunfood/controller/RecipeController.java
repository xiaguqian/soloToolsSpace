package com.xunfood.controller;

import com.xunfood.common.PageResult;
import com.xunfood.common.Result;
import com.xunfood.entity.Recipe;
import com.xunfood.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping("/list")
    public Result<PageResult<Recipe>> getRecipeList(
            @RequestParam(defaultValue = "recommend") String type,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        return Result.success(recipeService.getRecipeList(type, page, size));
    }

    @GetMapping("/detail/{id}")
    public Result<Recipe> getRecipeDetail(@PathVariable Long id) {
        return Result.success(recipeService.getRecipeDetail(id));
    }

    @PostMapping("/{id}/like")
    public Result<Void> toggleLike(@PathVariable Long id) {
        recipeService.toggleLike(id);
        return Result.success();
    }

    @PostMapping("/{id}/favorite")
    public Result<Void> toggleFavorite(@PathVariable Long id) {
        recipeService.toggleFavorite(id);
        return Result.success();
    }

    @PostMapping("/{id}/cook")
    public Result<List<Recipe.Step>> startCooking(@PathVariable Long id) {
        return Result.success(recipeService.startCooking(id));
    }

    @GetMapping("/my-favorites")
    public Result<List<Recipe>> getMyFavorites() {
        return Result.success(recipeService.getMyFavorites());
    }

    @GetMapping("/my-recipes")
    public Result<List<Recipe>> getMyRecipes() {
        return Result.success(recipeService.getMyRecipes());
    }
}
