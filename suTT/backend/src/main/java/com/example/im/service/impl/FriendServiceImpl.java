
package com.example.im.service.impl;

import com.example.im.entity.Blacklist;
import com.example.im.entity.Friend;
import com.example.im.repository.BlacklistRepository;
import com.example.im.repository.FriendRepository;
import com.example.im.service.FriendService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendServiceImpl implements FriendService {

    private final FriendRepository friendRepository;
    private final BlacklistRepository blacklistRepository;

    public FriendServiceImpl(FriendRepository friendRepository, 
                           BlacklistRepository blacklistRepository) {
        this.friendRepository = friendRepository;
        this.blacklistRepository = blacklistRepository;
    }

    @Override
    public void addFriend(Long userId, Long targetId, String message) {
        if (userId.equals(targetId)) {
            throw new RuntimeException("不能添加自己为好友");
        }
        if (friendRepository.existsByUserIdAndFriendId(userId, targetId)) {
            throw new RuntimeException("已经是好友或已发送过请求");
        }

        Friend friend = new Friend();
        friend.setUserId(targetId);
        friend.setFriendId(userId);
        friend.setGroupName("我的好友");
        friend.setStatus(0);
        friendRepository.save(friend);
    }

    @Override
    public void handleFriendRequest(Long userId, Long requesterId, Integer action) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, requesterId)
                .orElseThrow(() -> new RuntimeException("好友请求不存在"));

        if (action == 1) {
            friend.setStatus(1);
            friendRepository.save(friend);

            Friend reverseFriend = new Friend();
            reverseFriend.setUserId(requesterId);
            reverseFriend.setFriendId(userId);
            reverseFriend.setGroupName("我的好友");
            reverseFriend.setStatus(1);
            friendRepository.save(reverseFriend);
        } else if (action == 2) {
            friendRepository.delete(friend);
        } else if (action == 3) {
            friendRepository.delete(friend);
            addToBlacklist(userId, requesterId);
        }
    }

    @Override
    public List<Friend> getFriendList(Long userId) {
        return friendRepository.findByUserIdAndStatus(userId, 1);
    }

    @Override
    public void updateFriendRemark(Long userId, Long friendId, String remark) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId)
                .orElseThrow(() -> new RuntimeException("好友关系不存在"));
        friend.setRemark(remark);
        friendRepository.save(friend);
    }

    @Override
    public void updateFriendGroup(Long userId, Long friendId, String groupName) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId)
                .orElseThrow(() -> new RuntimeException("好友关系不存在"));
        friend.setGroupName(groupName);
        friendRepository.save(friend);
    }

    @Override
    public void addToBlacklist(Long userId, Long targetId) {
        if (blacklistRepository.existsByUserIdAndTargetId(userId, targetId)) {
            return;
        }
        Blacklist blacklist = new Blacklist();
        blacklist.setUserId(userId);
        blacklist.setTargetId(targetId);
        blacklistRepository.save(blacklist);
    }

    @Override
    public void removeFromBlacklist(Long userId, Long targetId) {
        blacklistRepository.findByUserIdAndTargetId(userId, targetId)
                .ifPresent(blacklistRepository::delete);
    }

    @Override
    public List<Long> getBlacklist(Long userId) {
        return blacklistRepository.findByUserId(userId).stream()
                .map(Blacklist::getTargetId)
                .collect(Collectors.toList());
    }
}
