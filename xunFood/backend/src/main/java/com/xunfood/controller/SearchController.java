package com.xunfood.controller;

import com.xunfood.common.Result;
import com.xunfood.entity.Recipe;
import com.xunfood.entity.User;
import com.xunfood.service.RecipeService;
import com.xunfood.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final RecipeService recipeService;
    private final UserService userService;

    @GetMapping("/all")
    public Result<SearchResult> search(@RequestParam String keyword) {
        SearchResult result = new SearchResult();
        result.setRecipes(recipeService.searchRecipes(keyword));
        result.setUsers(userService.searchUsers(keyword));
        return Result.success(result);
    }

    @Data
    public static class SearchResult {
        private List<Recipe> recipes;
        private List<User> users;
    }
}
