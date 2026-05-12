package com.soloim.service;

import com.soloim.entity.User;
import com.soloim.repository.UserRepository;
import com.soloim.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    public Map<String, Object> sendVerificationCode(String phone, String email) {
        String code = generateCode();
        String key = (phone != null ? "sms:" + phone : "email:" + email);
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("expireIn", 300);
        return result;
    }

    public boolean verifyCode(String phone, String email, String code) {
        String key = (phone != null ? "sms:" + phone : "email:" + email);
        String savedCode = redisTemplate.opsForValue().get(key);
        return code != null && code.equals(savedCode);
    }

    @Transactional
    public User register(String username, String password, String phone, String email, String code) {
        if (!verifyCode(phone, email, code)) {
            throw new RuntimeException("验证码错误或已过期");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("用户名已存在");
        }
        if (phone != null && userRepository.findByPhone(phone).isPresent()) {
            throw new RuntimeException("手机号已被注册");
        }
        if (email != null && userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("邮箱已被注册");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setEmail(email);
        user.setNickname(username);
        return userRepository.save(user);
    }

    public Map<String, Object> login(String account, String password) {
        User user = userRepository.findByUsernameOrPhoneOrEmail(account, account, account)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        user.setIsOnline(1);
        user.setLastLoginTime(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);
        return result;
    }

    public User getUserInfo(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Transactional
    public User updateProfile(Long userId, Map<String, Object> params) {
        User user = getUserInfo(userId);
        if (params.containsKey("nickname")) {
            user.setNickname((String) params.get("nickname"));
        }
        if (params.containsKey("signature")) {
            user.setSignature((String) params.get("signature"));
        }
        if (params.containsKey("gender")) {
            user.setGender((Integer) params.get("gender"));
        }
        if (params.containsKey("region")) {
            user.setRegion((String) params.get("region"));
        }
        return userRepository.save(user);
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            String uploadDir = "./uploads/avatar";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String fileName = UUID.randomUUID() + ext;
            File dest = new File(uploadDir + "/" + fileName);
            file.transferTo(dest);
            String avatarUrl = "/uploads/avatar/" + fileName;
            User user = getUserInfo(userId);
            user.setAvatar(avatarUrl);
            userRepository.save(user);
            return avatarUrl;
        } catch (IOException e) {
            throw new RuntimeException("头像上传失败: " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String phone, String email, String newPassword, String code) {
        if (!verifyCode(phone, email, code)) {
            throw new RuntimeException("验证码错误或已过期");
        }
        User user = null;
        if (phone != null) {
            user = userRepository.findByPhone(phone).orElse(null);
        } else if (email != null) {
            user = userRepository.findByEmail(email).orElse(null);
        }
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.searchByKeyword(keyword);
    }

    public void logout(Long userId) {
        User user = getUserInfo(userId);
        user.setIsOnline(0);
        userRepository.save(user);
    }

    private String generateCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }
}
