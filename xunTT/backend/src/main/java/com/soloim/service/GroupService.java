package com.soloim.service;

import com.soloim.entity.Group;
import com.soloim.entity.GroupMember;
import com.soloim.entity.User;
import com.soloim.repository.GroupMemberRepository;
import com.soloim.repository.GroupRepository;
import com.soloim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Group createGroup(Long ownerId, String groupName, List<Long> memberIds) {
        if (memberIds == null || memberIds.size() < 2) {
            throw new RuntimeException("创建群聊至少需要选择2个好友");
        }
        Group group = new Group();
        group.setGroupName(groupName);
        group.setGroupOwnerId(ownerId);
        group.setMemberCount(memberIds.size() + 1);
        Group savedGroup = groupRepository.save(group);
        GroupMember ownerMember = new GroupMember();
        ownerMember.setGroupId(savedGroup.getId());
        ownerMember.setUserId(ownerId);
        ownerMember.setRole(1);
        groupMemberRepository.save(ownerMember);
        for (Long memberId : memberIds) {
            GroupMember member = new GroupMember();
            member.setGroupId(savedGroup.getId());
            member.setUserId(memberId);
            member.setRole(3);
            groupMemberRepository.save(member);
        }
        return savedGroup;
    }

    public Group getGroupInfo(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("群组不存在"));
    }

    @Transactional
    public Group updateGroupInfo(Long groupId, Long userId, Map<String, Object> params) {
        Group group = getGroupInfo(groupId);
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("不是群成员"));
        if (member.getRole() != 1 && member.getRole() != 2) {
            throw new RuntimeException("只有群主和管理员可以修改群资料");
        }
        if (params.containsKey("groupName")) {
            group.setGroupName((String) params.get("groupName"));
        }
        if (params.containsKey("groupAvatar")) {
            group.setGroupAvatar((String) params.get("groupAvatar"));
        }
        if (params.containsKey("announcement")) {
            group.setAnnouncement((String) params.get("announcement"));
        }
        return groupRepository.save(group);
    }

    @Transactional
    public void addMembers(Long groupId, Long userId, List<Long> newMemberIds) {
        Group group = getGroupInfo(groupId);
        GroupMember operator = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("不是群成员"));
        if (operator.getRole() != 1 && operator.getRole() != 2) {
            throw new RuntimeException("只有群主和管理员可以添加成员");
        }
        for (Long newMemberId : newMemberIds) {
            if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, newMemberId)) {
                GroupMember newMember = new GroupMember();
                newMember.setGroupId(groupId);
                newMember.setUserId(newMemberId);
                newMember.setRole(3);
                groupMemberRepository.save(newMember);
            }
        }
        group.setMemberCount(groupMemberRepository.findByGroupId(groupId).size());
        groupRepository.save(group);
    }

    @Transactional
    public void removeMember(Long groupId, Long operatorId, Long targetUserId) {
        Group group = getGroupInfo(groupId);
        GroupMember operator = groupMemberRepository.findByGroupIdAndUserId(groupId, operatorId)
                .orElseThrow(() -> new RuntimeException("不是群成员"));
        GroupMember target = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new RuntimeException("目标用户不是群成员"));
        if (operator.getRole() != 1 && operator.getRole() != 2) {
            throw new RuntimeException("只有群主和管理员可以移除成员");
        }
        if (operator.getRole() == 2 && target.getRole() <= 2) {
            throw new RuntimeException("管理员不能移除群主或其他管理员");
        }
        groupMemberRepository.delete(target);
        group.setMemberCount(groupMemberRepository.findByGroupId(groupId).size());
        groupRepository.save(group);
    }

    @Transactional
    public void setAdmin(Long groupId, Long ownerId, Long targetUserId, boolean isAdmin) {
        Group group = getGroupInfo(groupId);
        if (!group.getGroupOwnerId().equals(ownerId)) {
            throw new RuntimeException("只有群主可以设置管理员");
        }
        GroupMember target = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new RuntimeException("目标用户不是群成员"));
        if (target.getRole() == 1) {
            throw new RuntimeException("群主已是最高权限");
        }
        target.setRole(isAdmin ? 2 : 3);
        groupMemberRepository.save(target);
    }

    @Transactional
    public void transferGroup(Long groupId, Long oldOwnerId, Long newOwnerId) {
        Group group = getGroupInfo(groupId);
        if (!group.getGroupOwnerId().equals(oldOwnerId)) {
            throw new RuntimeException("只有群主可以转让群");
        }
        GroupMember newOwner = groupMemberRepository.findByGroupIdAndUserId(groupId, newOwnerId)
                .orElseThrow(() -> new RuntimeException("新群主必须是群成员"));
        group.setGroupOwnerId(newOwnerId);
        groupRepository.save(group);
        GroupMember oldOwnerMember = groupMemberRepository.findByGroupIdAndUserId(groupId, oldOwnerId)
                .orElseThrow();
        oldOwnerMember.setRole(2);
        groupMemberRepository.save(oldOwnerMember);
        newOwner.setRole(1);
        groupMemberRepository.save(newOwner);
    }

    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        Group group = getGroupInfo(groupId);
        if (group.getGroupOwnerId().equals(userId)) {
            throw new RuntimeException("群主不能直接退群，请先转让群主或解散群");
        }
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("不是群成员"));
        groupMemberRepository.delete(member);
        group.setMemberCount(groupMemberRepository.findByGroupId(groupId).size());
        groupRepository.save(group);
    }

    public List<Map<String, Object>> getGroupMembers(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (GroupMember m : members) {
            User user = userRepository.findById(m.getUserId()).orElse(null);
            if (user != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("userId", m.getUserId());
                item.put("role", m.getRole());
                item.put("groupNickname", m.getGroupNickname());
                item.put("username", user.getUsername());
                item.put("nickname", user.getNickname());
                item.put("avatar", user.getAvatar());
                item.put("isOnline", user.getIsOnline());
                result.add(item);
            }
        }
        return result;
    }

    public List<Group> getUserGroups(Long userId) {
        List<GroupMember> groupMembers = groupMemberRepository.findByUserId(userId);
        List<Group> groups = new ArrayList<>();
        for (GroupMember gm : groupMembers) {
            groupRepository.findById(gm.getGroupId()).ifPresent(groups::add);
        }
        return groups;
    }
}
