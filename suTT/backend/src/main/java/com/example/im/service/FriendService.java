
package com.example.im.service;

import com.example.im.entity.Friend;

import java.util.List;

public interface FriendService {
    void addFriend(Long userId, Long targetId, String message);
    void handleFriendRequest(Long userId, Long requesterId, Integer action);
    List<Friend> getFriendList(Long userId);
    void updateFriendRemark(Long userId, Long friendId, String remark);
    void updateFriendGroup(Long userId, Long friendId, String groupName);
    void addToBlacklist(Long userId, Long targetId);
    void removeFromBlacklist(Long userId, Long targetId);
    List<Long> getBlacklist(Long userId);
}
