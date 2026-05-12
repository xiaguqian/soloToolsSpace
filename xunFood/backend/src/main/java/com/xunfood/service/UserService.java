package com.xunfood.service;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xunfood.entity.User;
import com.xunfood.entity.UserFollow;
import com.xunfood.mapper.UserFollowMapper;
import com.xunfood.mapper.UserMapper;
import com.xunfood.utils.JwtUtil;
import com.xunfood.utils.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserFollowMapper userFollowMapper;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private static final String SMS_CODE_KEY = "sms:code:";

    public void sendSmsCode(String phone) {
        String code = "123456";
        redisTemplate.opsForValue().set(SMS_CODE_KEY + phone, code, 5, TimeUnit.MINUTES);
        log.info("发送验证码到手机: {}, 验证码: {}", phone, code);
    }

    public Map<String, Object> loginByPhone(String phone, String code) {
        String storedCode = redisTemplate.opsForValue().get(SMS_CODE_KEY + phone);
        if (storedCode == null || !storedCode.equals(code)) {
            throw new RuntimeException("验证码错误");
        }
        redisTemplate.delete(SMS_CODE_KEY + phone);

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setNickname("美食达人" + RandomUtil.randomNumbers(4));
            user.setLevel(0);
            userMapper.insert(user);
        }

        String token = jwtUtil.generateToken(user.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", safeUser(user));
        return result;
    }

    public Map<String, Object> loginByPassword(String account, String password) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, account).or().eq(User::getUsername, account));
        
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (user.getPassword() == null || !BCrypt.checkpw(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", safeUser(user));
        return result;
    }

    public void register(String phone, String code, String password, String nickname) {
        String storedCode = redisTemplate.opsForValue().get(SMS_CODE_KEY + phone);
        if (storedCode == null || !storedCode.equals(code)) {
            throw new RuntimeException("验证码错误");
        }
        redisTemplate.delete(SMS_CODE_KEY + phone);

        User existUser = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        if (existUser != null) {
            throw new RuntimeException("该手机号已注册");
        }

        User user = new User();
        user.setPhone(phone);
        user.setPassword(BCrypt.hashpw(password));
        user.setNickname(nickname != null ? nickname : "美食达人" + RandomUtil.randomNumbers(4));
        user.setLevel(0);
        userMapper.insert(user);
    }

    public User getCurrentUser() {
        Long userId = UserContext.getUserId();
        if (userId == null) return null;
        User user = userMapper.selectById(userId);
        return user != null ? safeUser(user) : null;
    }

    public User getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) return null;
        
        Long currentUserId = UserContext.getUserId();
        if (currentUserId != null) {
            UserFollow follow = userFollowMapper.selectOne(new LambdaQueryWrapper<UserFollow>()
                    .eq(UserFollow::getFollowerId, currentUserId)
                    .eq(UserFollow::getFollowingId, id));
            user.setFollowed(follow != null);
        }
        
        return safeUser(user);
    }

    @Transactional
    public void followUser(Long followingId) {
        Long currentUserId = UserContext.getUserId();
        if (currentUserId == null) throw new RuntimeException("请先登录");
        if (currentUserId.equals(followingId)) throw new RuntimeException("不能关注自己");

        UserFollow exist = userFollowMapper.selectOne(new LambdaQueryWrapper<UserFollow>()
                .eq(UserFollow::getFollowerId, currentUserId)
                .eq(UserFollow::getFollowingId, followingId));

        if (exist == null) {
            UserFollow follow = new UserFollow();
            follow.setFollowerId(currentUserId);
            follow.setFollowingId(followingId);
            userFollowMapper.insert(follow);

            User follower = userMapper.selectById(currentUserId);
            User following = userMapper.selectById(followingId);
            follower.setFollowingCount((follower.getFollowingCount() != null ? follower.getFollowingCount() : 0) + 1);
            following.setFollowerCount((following.getFollowerCount() != null ? following.getFollowerCount() : 0) + 1);
            userMapper.updateById(follower);
            userMapper.updateById(following);
        }
    }

    @Transactional
    public void unfollowUser(Long followingId) {
        Long currentUserId = UserContext.getUserId();
        if (currentUserId == null) throw new RuntimeException("请先登录");

        int deleted = userFollowMapper.delete(new LambdaQueryWrapper<UserFollow>()
                .eq(UserFollow::getFollowerId, currentUserId)
                .eq(UserFollow::getFollowingId, followingId));

        if (deleted > 0) {
            User follower = userMapper.selectById(currentUserId);
            User following = userMapper.selectById(followingId);
            follower.setFollowingCount(Math.max((follower.getFollowingCount() != null ? follower.getFollowingCount() : 0) - 1, 0));
            following.setFollowerCount(Math.max((following.getFollowerCount() != null ? following.getFollowerCount() : 0) - 1, 0));
            userMapper.updateById(follower);
            userMapper.updateById(following);
        }
    }

    public List<User> searchUsers(String keyword) {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>()
                .like(User::getNickname, keyword)
                .or().like(User::getUsername, keyword)
                .last("LIMIT 20"));
        
        users.forEach(u -> {
            u.setPassword(null);
            u.setPhone(null);
        });
        return users;
    }

    public void updateUserLevel(User user) {
        int level = 0;
        if (user.getRecipeCount() != null && user.getRecipeCount() > 0) {
            level = 1;
        }
        if ((user.getLikeCount() != null && user.getLikeCount() >= 100) || 
            (user.getFavoriteCount() != null && user.getFavoriteCount() >= 100)) {
            level = 2;
        }
        if (!level.equals(user.getLevel())) {
            user.setLevel(level);
            userMapper.updateById(user);
        }
    }

    private User safeUser(User user) {
        if (user == null) return null;
        user.setPassword(null);
        return user;
    }
}
