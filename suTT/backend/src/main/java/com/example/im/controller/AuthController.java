
package com.example.im.controller;

import com.example.im.config.JwtConfig;
import com.example.im.dto.request.LoginRequest;
import com.example.im.dto.request.RegisterRequest;
import com.example.im.dto.request.UpdateProfileRequest;
import com.example.im.dto.response.ApiResponse;
import com.example.im.entity.User;
import com.example.im.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtConfig jwtConfig;

    public AuthController(UserService userService, JwtConfig jwtConfig) {
        this.userService = userService;
        this.jwtConfig = jwtConfig;
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        String token = jwtConfig.generateToken(user.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("token", token);
        
        return ApiResponse.success(result);
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request.getAccount(), request.getPassword());
        String token = jwtConfig.generateToken(user.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("token", token);
        
        return ApiResponse.success(result);
    }

    @GetMapping("/user/{id}")
    public ApiResponse<User> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PutMapping("/user/{id}/profile")
    public ApiResponse<User> updateProfile(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(id, request);
        return ApiResponse.success(user);
    }
}
