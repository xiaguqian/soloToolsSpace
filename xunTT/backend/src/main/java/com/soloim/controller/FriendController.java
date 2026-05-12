package com.soloim.controller;

import com.soloim.common.Result;
import com.soloim.entity.FriendGroup;
import com.soloim.entity.FriendRequest;
import com.soloim.security.JwtUtil;
import com.soloim.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friend")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final JwtUtil jwtUtil;

    @PostMapping("/request")
    public Result<FriendRequest> sendFriendRequest(@RequestHeader("Authorization") String token,
                                                    @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        Long toUserId = Long.valueOf(params.get("toUserId").toString());
        String message = (String) params.get("message");
        return Result.success(friendService.sendFriendRequest(userId, toUserId, message));
    }

    @GetMapping("/requests")
    public Result<List<FriendRequest>> getFriendRequests(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(friendService.getFriendRequests(userId));
    }

    @PostMapping("/request/{requestId}/accept")
    public Result<?> acceptFriendRequest(@RequestHeader("Authorization") String token,
                                          @PathVariable Long requestId) {
        Long userId = getUserIdFromToken(token);
        friendService.acceptFriendRequest(requestId, userId);
        return Result.success("已添加好友", null);
    }

    @PostMapping("/request/{requestId}/reject")
    public Result<?> rejectFriendRequest(@RequestHeader("Authorization") String token,
                                          @PathVariable Long requestId) {
        Long userId = getUserIdFromToken(token);
        friendService.rejectFriendRequest(requestId, userId);
        return Result.success("已拒绝", null);
    }

    @PostMapping("/{friendId}/blacklist")
    public Result<?> addToBlacklist(@RequestHeader("Authorization") String token,
                                     @PathVariable Long friendId) {
        Long userId = getUserIdFromToken(token);
        friendService.addToBlacklist(userId, friendId);
        return Result.success("已加入黑名单", null);
    }

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getFriends(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(friendService.getFriendsWithInfo(userId));
    }

    @GetMapping("/groups")
    public Result<List<FriendGroup>> getGroups(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(friendService.getFriendGroups(userId));
    }

    @PostMapping("/group")
    public Result<FriendGroup> createGroup(@RequestHeader("Authorization") String token,
                                            @RequestBody Map<String, String> params) {
        Long userId = getUserIdFromToken(token);
        String groupName = params.get("groupName");
        return Result.success(friendService.createFriendGroup(userId, groupName));
    }

    @PutMapping("/group/{groupId}")
    public Result<FriendGroup> renameGroup(@RequestHeader("Authorization") String token,
                                            @PathVariable Long groupId,
                                            @RequestBody Map<String, String> params) {
        Long userId = getUserIdFromToken(token);
        String newName = params.get("groupName");
        return Result.success(friendService.renameFriendGroup(groupId, userId, newName));
    }

    @DeleteMapping("/group/{groupId}")
    public Result<?> deleteGroup(@RequestHeader("Authorization") String token,
                                  @PathVariable Long groupId) {
        Long userId = getUserIdFromToken(token);
        friendService.deleteFriendGroup(groupId, userId);
        return Result.success("分组已删除", null);
    }

    @PutMapping("/{friendId}/remark")
    public Result<?> updateRemark(@RequestHeader("Authorization") String token,
                                   @PathVariable Long friendId,
                                   @RequestBody Map<String, String> params) {
        Long userId = getUserIdFromToken(token);
        String remark = params.get("remark");
        friendService.updateFriendRemark(userId, friendId, remark);
        return Result.success("备注已更新", null);
    }

    @PutMapping("/{friendId}/tags")
    public Result<?> updateTags(@RequestHeader("Authorization") String token,
                                 @PathVariable Long friendId,
                                 @RequestBody Map<String, String> params) {
        Long userId = getUserIdFromToken(token);
        String tags = params.get("tags");
        friendService.updateFriendTags(userId, friendId, tags);
        return Result.success("标签已更新", null);
    }

    @DeleteMapping("/{friendId}")
    public Result<?> removeFriend(@RequestHeader("Authorization") String token,
                                   @PathVariable Long friendId) {
        Long userId = getUserIdFromToken(token);
        friendService.removeFriend(userId, friendId);
        return Result.success("已删除好友", null);
    }

    private Long getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        throw new RuntimeException("未登录");
    }
}
