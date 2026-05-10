package com.task.config;

import com.task.entity.User;
import com.task.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initUser("admin", "admin123", "系统管理员", "admin@example.com", User.Role.ADMIN);
        initUser("user", "user123", "普通用户", "user@example.com", User.Role.USER);
    }

    private void initUser(String username, String rawPassword, String nickname, String email, User.Role role) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setNickname(nickname);
                user.setEmail(email);
                user.setRole(role);
                user.setEnabled(true);
                userRepository.save(user);
            }
        } else {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setNickname(nickname);
            user.setEmail(email);
            user.setRole(role);
            user.setEnabled(true);
            userRepository.save(user);
        }
    }
}
