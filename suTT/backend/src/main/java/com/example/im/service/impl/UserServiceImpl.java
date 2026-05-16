
package com.example.im.service.impl;

import com.example.im.dto.request.RegisterRequest;
import com.example.im.dto.request.UpdateProfileRequest;
import com.example.im.entity.User;
import com.example.im.repository.BlacklistRepository;
import com.example.im.repository.UserRepository;
import com.example.im.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BlacklistRepository blacklistRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, 
                          BlacklistRepository blacklistRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.blacklistRepository = blacklistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("手机号已被注册");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setNickname(request.getUsername());

        return userRepository.save(user);
    }

    @Override
    public User login(String account, String password) {
        User user = userRepository.findByUsername(account)
                .orElseGet(() -> userRepository.findByPhone(account)
                        .orElseGet(() -> userRepository.findByEmail(account)
                                .orElseThrow(() -> new RuntimeException("账号不存在"))));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        user.setOnline(true);
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Override
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getSignature() != null) {
            user.setSignature(request.getSignature());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getRegion() != null) {
            user.setRegion(request.getRegion());
        }

        return userRepository.save(user);
    }

    @Override
    public void updateOnlineStatus(Long userId, Boolean online) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(online);
            userRepository.save(user);
        });
    }

    @Override
    public boolean checkIfInBlacklist(Long userId, Long targetId) {
        return blacklistRepository.existsByUserIdAndTargetId(userId, targetId);
    }
}
