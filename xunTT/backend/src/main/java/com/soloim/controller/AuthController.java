package com.soloim.controller;

import com.soloim.common.Result;
import com.soloim.security.JwtUtil;
import com.soloim.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/send-code")
    public Result<Map<String, Object>> sendCode(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String email = params.get("email");
        return Result.success(userService.sendVerificationCode(phone, email));
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        String phone = params.get("phone");
        String email = params.get("email");
        String code = params.get("code");
        userService.register(username, password, phone, email, code);
        return Result.success("注册成功", null);
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String account = params.get("account");
        String password = params.get("password");
        return Result.success(userService.login(account, password));
    }

    @PostMapping("/reset-password")
    public Result<?> resetPassword(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String email = params.get("email");
        String newPassword = params.get("newPassword");
        String code = params.get("code");
        userService.resetPassword(phone, email, newPassword, code);
        return Result.success("密码重置成功", null);
    }

    @PostMapping("/logout")
    public Result<?> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Long userId = jwtUtil.getUserIdFromToken(token);
            userService.logout(userId);
        }
        return Result.success("登出成功", null);
    }
}
