
package com.example.im.service;

import com.example.im.dto.request.RegisterRequest;
import com.example.im.dto.request.UpdateProfileRequest;
import com.example.im.entity.User;

public interface UserService {
    User register(RegisterRequest request);
    User login(String account, String password);
    User getUserById(Long id);
    User updateProfile(Long userId, UpdateProfileRequest request);
    void updateOnlineStatus(Long userId, Boolean online);
    boolean checkIfInBlacklist(Long userId, Long targetId);
}
