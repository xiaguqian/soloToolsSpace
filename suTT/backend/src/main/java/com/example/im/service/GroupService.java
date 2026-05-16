
package com.example.im.service;

import com.example.im.dto.request.CreateGroupRequest;
import com.example.im.entity.Group;

import java.util.List;

public interface GroupService {
    Group createGroup(Long userId, CreateGroupRequest request);
    void addMember(Long userId, Long groupId, Long memberId);
    void removeMember(Long userId, Long groupId, Long memberId);
    void setAdmin(Long userId, Long groupId, Long memberId, Boolean isAdmin);
    void transferGroup(Long userId, Long groupId, Long newOwnerId);
    Group updateGroupInfo(Long userId, Long groupId, String name, String avatar, String notice);
    List<Group> getGroupsByUserId(Long userId);
}
