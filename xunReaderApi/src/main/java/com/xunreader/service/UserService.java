package com.xunreader.service;

import com.xunreader.entity.Role;
import com.xunreader.entity.User;
import com.xunreader.mapper.RoleMapper;
import com.xunreader.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, RoleMapper roleMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public User getUserByUsername(String username) {
        return userMapper.selectList(null).stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElse(null);
    }

    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }

    public void updateUserRole(Long userId, String role) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setRole(role);
            userMapper.updateById(user);
        }
    }

    public List<Role> getAllRoles() {
        return roleMapper.selectList(null);
    }

    public void createRole(Role role) {
        roleMapper.insert(role);
    }

    public void updateRole(Role role) {
        roleMapper.updateById(role);
    }

    public void deleteRole(Long roleId) {
        roleMapper.deleteById(roleId);
    }

    public void registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("reader");
        user.setStatus(1);
        userMapper.insert(user);
    }
}