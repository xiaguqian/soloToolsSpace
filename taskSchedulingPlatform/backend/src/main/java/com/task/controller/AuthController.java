package com.task.controller;

import com.task.common.Result;
import com.task.config.JwtTokenUtil;
import com.task.entity.User;
import com.task.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return Result.error(400, "用户名和密码不能为空");
        }

        Optional<User> userOpt = userService.findByUsername(username);
        if (!userOpt.isPresent()) {
            return Result.error(401, "用户不存在");
        }

        User user = userOpt.get();
        if (!user.getEnabled()) {
            return Result.error(403, "用户已被禁用");
        }

        if (!userService.validatePassword(password, user.getPassword())) {
            return Result.error(401, "密码错误");
        }

        String token = jwtTokenUtil.generateToken(user.getUsername(), user.getRole().name());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("username", user.getUsername());
        result.put("nickname", user.getNickname());
        result.put("role", user.getRole().name());
        result.put("id", user.getId());

        return Result.success("登录成功", result);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return Result.error(400, "用户名已存在");
        }

        user.setRole(User.Role.USER);
        user.setEnabled(true);
        User savedUser = userService.save(user);

        return Result.success("注册成功", savedUser);
    }
}
