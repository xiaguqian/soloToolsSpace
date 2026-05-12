package com.soloim.controller;

import com.soloim.common.Result;
import com.soloim.entity.Conversation;
import com.soloim.entity.Message;
import com.soloim.security.JwtUtil;
import com.soloim.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final JwtUtil jwtUtil;

    @PostMapping("/send")
    public Result<Message> sendMessage(@RequestHeader("Authorization") String token,
                                        @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        Integer conversationType = (Integer) params.get("conversationType");
        Long receiverId = params.get("receiverId") != null ? 
            Long.valueOf(params.get("receiverId").toString()) : null;
        Long groupId = params.get("groupId") != null ? 
            Long.valueOf(params.get("groupId").toString()) : null;
        Integer messageType = (Integer) params.get("messageType");
        String content = (String) params.get("content");
        Long quoteMessageId = params.get("quoteMessageId") != null ? 
            Long.valueOf(params.get("quoteMessageId").toString()) : null;
        return Result.success(messageService.sendMessage(
            userId, receiverId, groupId, conversationType, 
            messageType, content, quoteMessageId
        ));
    }

    @PostMapping("/upload")
    public Result<String> uploadFile(@RequestParam("file") MultipartFile file) {
        return Result.success(messageService.uploadFile(file));
    }

    @GetMapping("/history")
    public Result<List<Message>> getHistoryMessages(
            @RequestParam String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return Result.success(messageService.getHistoryMessages(conversationId, page, size));
    }

    @PostMapping("/{messageId}/revoke")
    public Result<?> revokeMessage(@RequestHeader("Authorization") String token,
                                    @PathVariable Long messageId) {
        Long userId = getUserIdFromToken(token);
        messageService.revokeMessage(messageId, userId);
        return Result.success("消息已撤回", null);
    }

    @PostMapping("/forward")
    public Result<List<Message>> forwardMessages(@RequestHeader("Authorization") String token,
                                                  @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        @SuppressWarnings("unchecked")
        List<Long> messageIds = (List<Long>) params.get("messageIds");
        Integer conversationType = (Integer) params.get("conversationType");
        Long receiverId = params.get("receiverId") != null ? 
            Long.valueOf(params.get("receiverId").toString()) : null;
        Long groupId = params.get("groupId") != null ? 
            Long.valueOf(params.get("groupId").toString()) : null;
        return Result.success(messageService.forwardMessages(
            messageIds, userId, receiverId, groupId, conversationType
        ));
    }

    @PostMapping("/merge-forward")
    public Result<Message> mergeForwardMessages(@RequestHeader("Authorization") String token,
                                                 @RequestBody Map<String, Object> params) {
        Long userId = getUserIdFromToken(token);
        @SuppressWarnings("unchecked")
        List<Long> messageIds = (List<Long>) params.get("messageIds");
        Integer conversationType = (Integer) params.get("conversationType");
        Long receiverId = params.get("receiverId") != null ? 
            Long.valueOf(params.get("receiverId").toString()) : null;
        Long groupId = params.get("groupId") != null ? 
            Long.valueOf(params.get("groupId").toString()) : null;
        return Result.success(messageService.mergeForwardMessages(
            messageIds, userId, receiverId, groupId, conversationType
        ));
    }

    @GetMapping("/conversations")
    public Result<List<Conversation>> getConversations(@RequestHeader("Authorization") String token) {
        Long userId = getUserIdFromToken(token);
        return Result.success(messageService.getUserConversations(userId));
    }

    @PostMapping("/conversation/{conversationId}/top")
    public Result<Conversation> setTopConversation(@RequestHeader("Authorization") String token,
                                                    @PathVariable String conversationId,
                                                    @RequestParam boolean isTop) {
        Long userId = getUserIdFromToken(token);
        return Result.success(messageService.setTopConversation(userId, conversationId, isTop));
    }

    @PostMapping("/conversation/{conversationId}/mute")
    public Result<Conversation> setMuteConversation(@RequestHeader("Authorization") String token,
                                                     @PathVariable String conversationId,
                                                     @RequestParam boolean isMute) {
        Long userId = getUserIdFromToken(token);
        return Result.success(messageService.setMuteConversation(userId, conversationId, isMute));
    }

    @PostMapping("/conversation/{conversationId}/read")
    public Result<?> markConversationRead(@RequestHeader("Authorization") String token,
                                           @PathVariable String conversationId) {
        Long userId = getUserIdFromToken(token);
        messageService.markConversationRead(userId, conversationId);
        return Result.success("已标记为已读", null);
    }

    @DeleteMapping("/conversation/{conversationId}")
    public Result<?> deleteConversation(@RequestHeader("Authorization") String token,
                                         @PathVariable String conversationId) {
        Long userId = getUserIdFromToken(token);
        messageService.deleteConversation(userId, conversationId);
        return Result.success("会话已删除", null);
    }

    private Long getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        throw new RuntimeException("未登录");
    }
}
