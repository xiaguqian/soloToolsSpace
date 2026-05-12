package com.soloim.controller;

import com.soloim.common.Result;
import com.soloim.entity.Group;
import com.soloim.security.JwtUtil;
import com.soloim.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public Result<Group> createGroup(@RequestHeader("Authorization") String token,
                                      @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        String groupName = (String) params.get("groupName");
        @SuppressWarnings("unchecked")
        List<Long> memberIds = (List<Long>) params.get("memberIds");
        return Result.success(groupService.createGroup(userId, groupName, memberIds));
    }

    @GetMapping("/{groupId}")
    public Result<Group> getGroupInfo(@PathVariable Long groupId) {
        return Result.success(groupService.getGroupInfo(groupId));
    }

    @PutMapping("/{groupId}")
    public Result<Group> updateGroupInfo(@RequestHeader("Authorization") String token,
                                          @PathVariable Long groupId,
                                          @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        return Result.success(groupService.updateGroupInfo(groupId, userId, params));
    }

    @PostMapping("/{groupId}/members")
    public Result<?> addMembers(@RequestHeader("Authorization") String token,
                                 @PathVariable Long groupId,
                                 @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        @SuppressWarnings("unchecked")
        List<Long> newMemberIds = (List<Long>) params.get("memberIds");
        groupService.addMembers(groupId, userId, newMemberIds);
        return Result.success("已添加成员", null);
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public Result<?> removeMember(@RequestHeader("Authorization") String token,
                                   @PathVariable Long groupId,
                                   @PathVariable Long memberId) {
        Long userId = getUserIdFromToken(token);
        groupService.removeMember(groupId, userId, memberId);
        return Result.success("已移除成员", null);
    }

    @PostMapping("/{groupId}/admin/{memberId}")
    public Result<?> setAdmin(@RequestHeader("Authorization") String token,
                               @PathVariable Long groupId,
                               @PathVariable Long memberId,
                               @RequestParam Boolean isAdmin) {
        Long userId = getUserIdFromToken(token);
        groupService.setAdmin(groupId, userId, memberId, isAdmin);
        return Result.success(isAdmin ? "已设置为管理员" : "已取消管理员", null);
    }

    @PostMapping("/{groupId}/transfer")
    public Result<?> transferGroup(@RequestHeader("Authorization") String token,
                                    @PathVariable Long groupId,
                                    @RequestBody Map<String, Long> params) {
        Long userId = getUserIdFromToken(token);
        Long newOwnerId = params.get("newOwnerId");
        groupService.transferGroup(groupId, userId, newOwnerId);
        return Result.success("群主已转让", null);
    }

    @PostMapping("/{groupId}/leave")
    public Result<?> leaveGroup(@RequestHeader("Authorization") String token,
                                 @PathVariable Long groupId) {
        Long userId = getUserIdFromToken(token);
        groupService.leaveGroup(groupId, userId);
        return Result.success("已退出群聊", null);
    }

    @GetMapping("/{groupId}/members")
    public Result<List<Map<String, Object>>> getMembers(@PathVariable Long groupId) {
        return Result.success(groupService.getGroupMembers(groupId));
    }

    @GetMapping("/my")
    public Result<List<Group>> getUserGroups(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(groupService.getUserGroups(userId));
    }

    private Long getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        throw new RuntimeException("未登录");
    }
}
