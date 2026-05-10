package com.task.controller;

import com.task.common.Result;
import com.task.entity.User;
import com.task.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<List<User>> list() {
        List<User> users = userService.findAll();
        return Result.success(users);
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (!userOpt.isPresent()) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(userOpt.get());
    }

    @PostMapping
    public Result<User> create(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return Result.error(400, "用户名已存在");
        }
        User savedUser = userService.save(user);
        return Result.success("创建成功", savedUser);
    }

    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @RequestBody User user) {
        Optional<User> userOpt = userService.findById(id);
        if (!userOpt.isPresent()) {
            return Result.error(404, "用户不存在");
        }

        User existingUser = userOpt.get();
        
        if (user.getNickname() != null) {
            existingUser.setNickname(user.getNickname());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }
        if (user.getEnabled() != null) {
            existingUser.setEnabled(user.getEnabled());
        }
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(user.getPassword());
        }

        User updatedUser = userService.save(existingUser);
        return Result.success("更新成功", updatedUser);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (!userOpt.isPresent()) {
            return Result.error(404, "用户不存在");
        }
        
        userService.delete(id);
        return Result.success("删除成功", null);
    }
}
