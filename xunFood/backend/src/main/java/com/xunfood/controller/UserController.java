package com.xunfood.controller;

import com.xunfood.common.Result;
import com.xunfood.entity.User;
import com.xunfood.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Result<User> getCurrentUser() {
        return Result.success(userService.getCurrentUser());
    }

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @PostMapping("/{id}/follow")
    public Result<Void> followUser(@PathVariable Long id) {
        userService.followUser(id);
        return Result.success();
    }

    @PostMapping("/{id}/unfollow")
    public Result<Void> unfollowUser(@PathVariable Long id) {
        userService.unfollowUser(id);
        return Result.success();
    }

    @GetMapping("/{id}/followers")
    public Result<List<User>> getFollowers(@PathVariable Long id) {
        return Result.success(userService.getFollowers(id));
    }

    @GetMapping("/{id}/followings")
    public Result<List<User>> getFollowings(@PathVariable Long id) {
        return Result.success(userService.getFollowings(id));
    }
}
