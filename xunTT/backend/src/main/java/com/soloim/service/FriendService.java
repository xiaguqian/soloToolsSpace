package com.soloim.service;

import com.soloim.entity.*;
import com.soloim.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final FriendGroupRepository friendGroupRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public FriendRequest sendFriendRequest(Long fromUserId, Long toUserId, String message) {
        if (fromUserId.equals(toUserId)) {
            throw new RuntimeException("不能添加自己为好友");
        }
        if (friendRepository.existsByUserIdAndFriendIdAndStatus(fromUserId, toUserId, 1)) {
            throw new RuntimeException("已经是好友了");
        }
        Optional<FriendRequest> existing = friendRequestRepository
                .findByFromUserIdAndToUserIdAndStatus(fromUserId, toUserId, 0);
        if (existing.isPresent()) {
            throw new RuntimeException("好友请求已发送，等待对方处理");
        }
        FriendRequest request = new FriendRequest();
        request.setFromUserId(fromUserId);
        request.setToUserId(toUserId);
        request.setMessage(message);
        return friendRequestRepository.save(request);
    }

    public List<FriendRequest> getFriendRequests(Long userId) {
        return friendRequestRepository.findByToUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void acceptFriendRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("好友请求不存在"));
        if (!request.getToUserId().equals(userId)) {
            throw new RuntimeException("无权处理此请求");
        }
        if (request.getStatus() != 0) {
            throw new RuntimeException("请求已处理");
        }
        request.setStatus(1);
        friendRequestRepository.save(request);
        FriendGroup defaultGroup = friendGroupRepository
                .findByUserIdAndIsDefault(userId, 1)
                .orElseGet(() -> createDefaultGroup(userId));
        FriendGroup fromDefaultGroup = friendGroupRepository
                .findByUserIdAndIsDefault(request.getFromUserId(), 1)
                .orElseGet(() -> createDefaultGroup(request.getFromUserId()));
        Friend f1 = new Friend();
        f1.setUserId(userId);
        f1.setFriendId(request.getFromUserId());
        f1.setGroupId(defaultGroup.getId());
        f1.setStatus(1);
        friendRepository.save(f1);
        Friend f2 = new Friend();
        f2.setUserId(request.getFromUserId());
        f2.setFriendId(userId);
        f2.setGroupId(fromDefaultGroup.getId());
        f2.setStatus(1);
        friendRepository.save(f2);
    }

    @Transactional
    public void rejectFriendRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("好友请求不存在"));
        if (!request.getToUserId().equals(userId)) {
            throw new RuntimeException("无权处理此请求");
        }
        request.setStatus(2);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void addToBlacklist(Long userId, Long friendId) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId)
                .orElseThrow(() -> new RuntimeException("好友关系不存在"));
        friend.setStatus(2);
        friendRepository.save(friend);
    }

    public List<FriendGroup> getFriendGroups(Long userId) {
        return friendGroupRepository.findByUserIdOrderBySortOrderAsc(userId);
    }

    @Transactional
    public FriendGroup createFriendGroup(Long userId, String groupName) {
        if (friendGroupRepository.findByUserIdAndGroupName(userId, groupName).isPresent()) {
            throw new RuntimeException("分组名称已存在");
        }
        FriendGroup group = new FriendGroup();
        group.setUserId(userId);
        group.setGroupName(groupName);
        group.setIsDefault(0);
        List<FriendGroup> groups = friendGroupRepository.findByUserIdOrderBySortOrderAsc(userId);
        group.setSortOrder(groups.size());
        return friendGroupRepository.save(group);
    }

    @Transactional
    public FriendGroup renameFriendGroup(Long groupId, Long userId, String newName) {
        FriendGroup group = friendGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("分组不存在"));
        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此分组");
        }
        if (group.getIsDefault() == 1) {
            throw new RuntimeException("默认分组不能重命名");
        }
        group.setGroupName(newName);
        return friendGroupRepository.save(group);
    }

    @Transactional
    public void deleteFriendGroup(Long groupId, Long userId) {
        FriendGroup group = friendGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("分组不存在"));
        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此分组");
        }
        if (group.getIsDefault() == 1) {
            throw new RuntimeException("默认分组不能删除");
        }
        FriendGroup defaultGroup = friendGroupRepository
                .findByUserIdAndIsDefault(userId, 1)
                .orElseGet(() -> createDefaultGroup(userId));
        List<Friend> friends = friendRepository.findByUserIdAndGroupId(userId, groupId);
        for (Friend f : friends) {
            f.setGroupId(defaultGroup.getId());
            friendRepository.save(f);
        }
        friendGroupRepository.delete(group);
    }

    public List<Map<String, Object>> getFriendsWithInfo(Long userId) {
        List<Friend> friends = friendRepository.findByUserIdAndStatus(userId, 1);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Friend f : friends) {
            User friendUser = userRepository.findById(f.getFriendId()).orElse(null);
            if (friendUser != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("friendId", f.getFriendId());
                item.put("groupId", f.getGroupId());
                item.put("remark", f.getRemark());
                item.put("tags", f.getTags());
                item.put("status", f.getStatus());
                item.put("username", friendUser.getUsername());
                item.put("nickname", friendUser.getNickname());
                item.put("avatar", friendUser.getAvatar());
                item.put("signature", friendUser.getSignature());
                item.put("isOnline", friendUser.getIsOnline());
                result.add(item);
            }
        }
        return result;
    }

    @Transactional
    public Friend updateFriendRemark(Long userId, Long friendId, String remark) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId)
                .orElseThrow(() -> new RuntimeException("好友关系不存在"));
        friend.setRemark(remark);
        return friendRepository.save(friend);
    }

    @Transactional
    public Friend updateFriendTags(Long userId, Long friendId, String tags) {
        Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId)
                .orElseThrow(() -> new RuntimeException("好友关系不存在"));
        friend.setTags(tags);
        return friendRepository.save(friend);
    }

    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        friendRepository.findByUserIdAndFriendId(userId, friendId).ifPresent(friendRepository::delete);
        friendRepository.findByUserIdAndFriendId(friendId, userId).ifPresent(friendRepository::delete);
    }

    private FriendGroup createDefaultGroup(Long userId) {
        FriendGroup group = new FriendGroup();
        group.setUserId(userId);
        group.setGroupName("我的好友");
        group.setIsDefault(1);
        group.setSortOrder(0);
        return friendGroupRepository.save(group);
    }
}
