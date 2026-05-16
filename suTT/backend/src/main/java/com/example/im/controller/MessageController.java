
package com.example.im.controller;

import com.example.im.dto.request.SendMessageRequest;
import com.example.im.dto.response.ApiResponse;
import com.example.im.entity.Message;
import com.example.im.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public ApiResponse<Message> sendMessage(@RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(1L, request);
        return ApiResponse.success(message);
    }

    @GetMapping("/chat/{targetId}")
    public ApiResponse<List<Message>> getChatHistory(@PathVariable Long targetId) {
        List<Message> messages = messageService.getChatHistory(1L, targetId);
        return ApiResponse.success(messages);
    }

    @GetMapping("/group/{groupId}")
    public ApiResponse<List<Message>> getGroupChatHistory(@PathVariable Long groupId) {
        List<Message> messages = messageService.getGroupChatHistory(groupId);
        return ApiResponse.success(messages);
    }

    @PostMapping("/recall/{messageId}")
    public ApiResponse<String> recallMessage(@PathVariable Long messageId) {
        messageService.recallMessage(1L, messageId);
        return ApiResponse.success("撤回成功");
    }

    @PostMapping("/forward/{messageId}")
    public ApiResponse<String> forwardMessage(@PathVariable Long messageId, 
                                              @RequestParam(required = false) Long targetId,
                                              @RequestParam(required = false) Long groupId) {
        messageService.forwardMessage(1L, messageId, targetId, groupId);
        return ApiResponse.success("转发成功");
    }

    @MessageMapping("/send")
    @SendTo("/topic/messages")
    public Message send(Message message) {
        return message;
    }
}
