package com.soloim.controller;

import com.soloim.common.Result;
import com.soloim.entity.User;
import com.soloim.security.JwtUtil;
import com.soloim.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/profile")
    public Result<User> getProfile(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(userService.getUserInfo(userId));
    }

    @PutMapping("/profile")
    public Result<User> updateProfile(@RequestHeader("Authorization") String token,
                                       @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        return Result.success(userService.updateProfile(userId, params));
    }

    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestHeader("Authorization") String token,
                                        @RequestParam("file") MultipartFile file) {
        Long userId = getUserIdFromToken(token);
        return Result.success(userService.uploadAvatar(userId, file));
    }

    @GetMapping("/search")
    public Result<List<User>> searchUsers(@RequestParam("keyword") String keyword) {
        return Result.success(userService.searchUsers(keyword));
    }

    @GetMapping("/{userId}")
    public Result<User> getUserById(@PathVariable Long userId) {
        return Result.success(userService.getUserInfo(userId));
    }

    private Long getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        throw new RuntimeException("未登录");
    }
}
