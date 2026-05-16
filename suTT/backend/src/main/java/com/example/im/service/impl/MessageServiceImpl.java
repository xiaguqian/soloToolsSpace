
package com.example.im.service.impl;

import com.example.im.dto.request.SendMessageRequest;
import com.example.im.entity.Message;
import com.example.im.repository.MessageRepository;
import com.example.im.service.MessageService;
import com.example.im.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;

    public MessageServiceImpl(MessageRepository messageRepository, UserService userService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
    }

    @Override
    public Message sendMessage(Long senderId, SendMessageRequest request) {
        if (request.getGroupId() == null && request.getReceiverId() == null) {
            throw new RuntimeException("必须指定接收者或群组");
        }

        if (request.getReceiverId() != null) {
            if (userService.checkIfInBlacklist(senderId, request.getReceiverId()) ||
                userService.checkIfInBlacklist(request.getReceiverId(), senderId)) {
                throw new RuntimeException("对方在黑名单中");
            }
        }

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(request.getReceiverId() != null ? request.getReceiverId() : 0L);
        message.setGroupId(request.getGroupId());
        message.setContent(request.getContent());
        message.setContentType(request.getContentType() != null ? request.getContentType() : "text");
        message.setStatus(0);
        message.setReplyTo(request.getReplyTo());
        message.setIsRecalled(false);

        return messageRepository.save(message);
    }

    @Override
    public List<Message> getChatHistory(Long userId, Long targetId) {
        List<Message> messages1 = messageRepository.findBySenderIdAndReceiverIdOrderByCreatedAtAsc(userId, targetId);
        List<Message> messages2 = messageRepository.findBySenderIdAndReceiverIdOrderByCreatedAtAsc(targetId, userId);
        messages1.addAll(messages2);
        messages1.sort((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()));
        return messages1;
    }

    @Override
    public List<Message> getGroupChatHistory(Long groupId) {
        return messageRepository.findByGroupIdOrderByCreatedAtAsc(groupId);
    }

    @Override
    public void recallMessage(Long userId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("消息不存在"));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("只能撤回自己的消息");
        }

        LocalDateTime now = LocalDateTime.now();
        if (message.getCreatedAt().plusMinutes(2).isBefore(now)) {
            throw new RuntimeException("超过2分钟无法撤回");
        }

        message.setIsRecalled(true);
        message.setContent("撤回了一条消息");
        messageRepository.save(message);
    }

    @Override
    public void forwardMessage(Long userId, Long messageId, Long targetId, Long groupId) {
        Message original = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("消息不存在"));

        Message message = new Message();
        message.setSenderId(userId);
        message.setReceiverId(targetId != null ? targetId : 0L);
        message.setGroupId(groupId);
        message.setContent(original.getContent());
        message.setContentType(original.getContentType());
        message.setStatus(0);
        message.setIsRecalled(false);

        messageRepository.save(message);
    }
}
