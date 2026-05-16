
package com.example.im.controller;

import com.example.im.dto.request.AddFriendRequest;
import com.example.im.dto.response.ApiResponse;
import com.example.im.entity.Friend;
import com.example.im.service.FriendService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/add")
    public ApiResponse<String> addFriend(@RequestBody AddFriendRequest request) {
        friendService.addFriend(1L, request.getTargetId(), request.getMessage());
        return ApiResponse.success("请求已发送");
    }

    @PostMapping("/handle/{requesterId}")
    public ApiResponse<String> handleFriendRequest(@PathVariable Long requesterId, @RequestParam Integer action) {
        friendService.handleFriendRequest(1L, requesterId, action);
        return ApiResponse.success("操作成功");
    }

    @GetMapping("/list")
    public ApiResponse<List<Friend>> getFriendList() {
        List<Friend> friends = friendService.getFriendList(1L);
        return ApiResponse.success(friends);
    }

    @PutMapping("/remark/{friendId}")
    public ApiResponse<String> updateRemark(@PathVariable Long friendId, @RequestParam String remark) {
        friendService.updateFriendRemark(1L, friendId, remark);
        return ApiResponse.success("修改成功");
    }

    @PutMapping("/group/{friendId}")
    public ApiResponse<String> updateGroup(@PathVariable Long friendId, @RequestParam String groupName) {
        friendService.updateFriendGroup(1L, friendId, groupName);
        return ApiResponse.success("修改成功");
    }

    @PostMapping("/blacklist/{targetId}")
    public ApiResponse<String> addToBlacklist(@PathVariable Long targetId) {
        friendService.addToBlacklist(1L, targetId);
        return ApiResponse.success("已加入黑名单");
    }

    @DeleteMapping("/blacklist/{targetId}")
    public ApiResponse<String> removeFromBlacklist(@PathVariable Long targetId) {
        friendService.removeFromBlacklist(1L, targetId);
        return ApiResponse.success("已移出黑名单");
    }

    @GetMapping("/blacklist")
    public ApiResponse<List<Long>> getBlacklist() {
        List<Long> blacklist = friendService.getBlacklist(1L);
        return ApiResponse.success(blacklist);
    }
}
