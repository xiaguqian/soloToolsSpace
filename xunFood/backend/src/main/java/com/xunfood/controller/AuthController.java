package com.xunfood.controller;

import com.xunfood.common.Result;
import com.xunfood.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/sms-code")
    public Result<Void> sendSmsCode(@RequestBody SmsCodeRequest request) {
        userService.sendSmsCode(request.getPhone());
        return Result.success();
    }

    @PostMapping("/login-phone")
    public Result<Map<String, Object>> loginByPhone(@RequestBody LoginPhoneRequest request) {
        return Result.success(userService.loginByPhone(request.getPhone(), request.getCode()));
    }

    @PostMapping("/login-password")
    public Result<Map<String, Object>> loginByPassword(@RequestBody LoginPasswordRequest request) {
        return Result.success(userService.loginByPassword(request.getAccount(), request.getPassword()));
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody RegisterRequest request) {
        userService.register(request.getPhone(), request.getCode(), request.getPassword(), request.getNickname());
        return Result.success();
    }

    @Data
    public static class SmsCodeRequest {
        private String phone;
    }

    @Data
    public static class LoginPhoneRequest {
        private String phone;
        private String code;
    }

    @Data
    public static class LoginPasswordRequest {
        private String account;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String phone;
        private String code;
        private String password;
        private String nickname;
    }
}
