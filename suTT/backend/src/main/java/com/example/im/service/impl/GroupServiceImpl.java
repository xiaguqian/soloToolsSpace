
package com.example.im.service.impl;

import com.example.im.dto.request.CreateGroupRequest;
import com.example.im.entity.Group;
import com.example.im.entity.GroupMember;
import com.example.im.repository.GroupMemberRepository;
import com.example.im.repository.GroupRepository;
import com.example.im.service.GroupService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    public GroupServiceImpl(GroupRepository groupRepository, 
                          GroupMemberRepository groupMemberRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Override
    public Group createGroup(Long userId, CreateGroupRequest request) {
        Group group = new Group();
        group.setName(request.getName());
        group.setCreatorId(userId);
        group = groupRepository.save(group);

        GroupMember creator = new GroupMember();
        creator.setGroupId(group.getId());
        creator.setUserId(userId);
        creator.setRole("owner");
        groupMemberRepository.save(creator);

        for (Long memberId : request.getMemberIds()) {
            if (!memberId.equals(userId)) {
                GroupMember member = new GroupMember();
                member.setGroupId(group.getId());
                member.setUserId(memberId);
                member.setRole("member");
                groupMemberRepository.save(member);
            }
        }

        return group;
    }

    @Override
    public void addMember(Long userId, Long groupId, Long memberId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("您不是群成员"));

        if (!"owner".equals(member.getRole()) && !"admin".equals(member.getRole())) {
            throw new RuntimeException("没有权限添加成员");
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, memberId)) {
            throw new RuntimeException("该用户已是群成员");
        }

        GroupMember newMember = new GroupMember();
        newMember.setGroupId(groupId);
        newMember.setUserId(memberId);
        newMember.setRole("member");
        groupMemberRepository.save(newMember);
    }

    @Override
    public void removeMember(Long userId, Long groupId, Long memberId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("您不是群成员"));

        if (!"owner".equals(member.getRole()) && !"admin".equals(member.getRole())) {
            throw new RuntimeException("没有权限移除成员");
        }

        GroupMember targetMember = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new RuntimeException("该用户不是群成员"));

        if ("owner".equals(targetMember.getRole())) {
            throw new RuntimeException("不能移除群主");
        }

        groupMemberRepository.delete(targetMember);
    }

    @Override
    public void setAdmin(Long userId, Long groupId, Long memberId, Boolean isAdmin) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("您不是群成员"));

        if (!"owner".equals(member.getRole())) {
            throw new RuntimeException("只有群主可以设置管理员");
        }

        GroupMember targetMember = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new RuntimeException("该用户不是群成员"));

        targetMember.setRole(isAdmin ? "admin" : "member");
        groupMemberRepository.save(targetMember);
    }

    @Override
    public void transferGroup(Long userId, Long groupId, Long newOwnerId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("您不是群成员"));

        if (!"owner".equals(member.getRole())) {
            throw new RuntimeException("只有群主可以转让群");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("群不存在"));

        GroupMember newOwner = groupMemberRepository.findByGroupIdAndUserId(groupId, newOwnerId)
                .orElseThrow(() -> new RuntimeException("新群主不是群成员"));

        member.setRole("member");
        newOwner.setRole("owner");
        group.setCreatorId(newOwnerId);

        groupMemberRepository.save(member);
        groupMemberRepository.save(newOwner);
        groupRepository.save(group);
    }

    @Override
    public Group updateGroupInfo(Long userId, Long groupId, String name, String avatar, String notice) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("您不是群成员"));

        if (!"owner".equals(member.getRole()) && !"admin".equals(member.getRole())) {
            throw new RuntimeException("没有权限修改群信息");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("群不存在"));

        if (name != null) {
            group.setName(name);
        }
        if (avatar != null) {
            group.setAvatar(avatar);
        }
        if (notice != null) {
            group.setNotice(notice);
        }

        return groupRepository.save(group);
    }

    @Override
    public List<Group> getGroupsByUserId(Long userId) {
        List<GroupMember> members = groupMemberRepository.findByUserId(userId);
        return members.stream()
                .map(member -> groupRepository.findById(member.getGroupId()).orElse(null))
                .filter(group -> group != null)
                .collect(Collectors.toList());
    }
}
