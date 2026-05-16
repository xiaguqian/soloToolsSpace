
package com.example.im.controller;

import com.example.im.dto.request.CreateGroupRequest;
import com.example.im.dto.response.ApiResponse;
import com.example.im.entity.Group;
import com.example.im.service.GroupService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/create")
    public ApiResponse<Group> createGroup(@RequestBody CreateGroupRequest request) {
        Group group = groupService.createGroup(1L, request);
        return ApiResponse.success(group);
    }

    @PostMapping("/{groupId}/members")
    public ApiResponse<String> addMember(@PathVariable Long groupId, @RequestParam Long memberId) {
        groupService.addMember(1L, groupId, memberId);
        return ApiResponse.success("添加成功");
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ApiResponse<String> removeMember(@PathVariable Long groupId, @PathVariable Long memberId) {
        groupService.removeMember(1L, groupId, memberId);
        return ApiResponse.success("移除成功");
    }

    @PutMapping("/{groupId}/admin/{memberId}")
    public ApiResponse<String> setAdmin(@PathVariable Long groupId, @PathVariable Long memberId, @RequestParam Boolean isAdmin) {
        groupService.setAdmin(1L, groupId, memberId, isAdmin);
        return ApiResponse.success("设置成功");
    }

    @PutMapping("/{groupId}/transfer/{newOwnerId}")
    public ApiResponse<String> transferGroup(@PathVariable Long groupId, @PathVariable Long newOwnerId) {
        groupService.transferGroup(1L, groupId, newOwnerId);
        return ApiResponse.success("转让成功");
    }

    @PutMapping("/{groupId}/info")
    public ApiResponse<Group> updateGroupInfo(@PathVariable Long groupId,
                                              @RequestParam(required = false) String name,
                                              @RequestParam(required = false) String avatar,
                                              @RequestParam(required = false) String notice) {
        Group group = groupService.updateGroupInfo(1L, groupId, name, avatar, notice);
        return ApiResponse.success(group);
    }

    @GetMapping("/list")
    public ApiResponse<List<Group>> getGroups() {
        List<Group> groups = groupService.getGroupsByUserId(1L);
        return ApiResponse.success(groups);
    }
}
