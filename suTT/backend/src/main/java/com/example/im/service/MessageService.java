
package com.example.im.service;

import com.example.im.dto.request.SendMessageRequest;
import com.example.im.entity.Message;

import java.util.List;

public interface MessageService {
    Message sendMessage(Long senderId, SendMessageRequest request);
    List<Message> getChatHistory(Long userId, Long targetId);
    List<Message> getGroupChatHistory(Long groupId);
    void recallMessage(Long userId, Long messageId);
    void forwardMessage(Long userId, Long messageId, Long targetId, Long groupId);
}
