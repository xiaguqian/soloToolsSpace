package com.soloim.service;

import com.soloim.entity.*;
import com.soloim.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, Long groupId, 
                               Integer conversationType, Integer messageType,
                               String content, Long quoteMessageId) {
        String conversationId = generateConversationId(conversationType, senderId, receiverId, groupId);
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setConversationType(conversationType);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setGroupId(groupId);
        message.setMessageType(messageType);
        message.setContent(content);
        message.setQuoteMessageId(quoteMessageId);
        Message saved = messageRepository.save(message);
        updateConversations(conversationId, conversationType, senderId, receiverId, groupId, saved.getId());
        return saved;
    }

    @Transactional
    public String uploadFile(MultipartFile file) {
        try {
            String uploadDir = "./uploads/files";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String fileName = UUID.randomUUID() + ext;
            File dest = new File(uploadDir + "/" + fileName);
            file.transferTo(dest);
            return "/uploads/files/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    public List<Message> getHistoryMessages(String conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<Message> messages = messagePage.getContent();
        Collections.reverse(messages);
        return messages;
    }

    @Transactional
    public boolean revokeMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("消息不存在"));
        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("只能撤回自己发送的消息");
        }
        if (message.getCreatedAt().plusMinutes(2).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("只能撤回2分钟内的消息");
        }
        message.setStatus(2);
        messageRepository.save(message);
        return true;
    }

    @Transactional
    public List<Message> forwardMessages(List<Long> messageIds, Long senderId, 
                                          Long receiverId, Long groupId, Integer conversationType) {
        List<Message> originalMessages = messageRepository.findByIdIn(messageIds);
        List<Message> forwarded = new ArrayList<>();
        for (Message original : originalMessages) {
            if (original.getStatus() == 2) continue;
            Message newMessage = new Message();
            String convId = generateConversationId(conversationType, senderId, receiverId, groupId);
            newMessage.setConversationId(convId);
            newMessage.setConversationType(conversationType);
            newMessage.setSenderId(senderId);
            newMessage.setReceiverId(receiverId);
            newMessage.setGroupId(groupId);
            newMessage.setMessageType(original.getMessageType());
            newMessage.setContent(original.getContent());
            newMessage.setFileUrl(original.getFileUrl());
            newMessage.setFileName(original.getFileName());
            newMessage.setFileSize(original.getFileSize());
            Message saved = messageRepository.save(newMessage);
            forwarded.add(saved);
            updateConversations(convId, conversationType, senderId, receiverId, groupId, saved.getId());
        }
        return forwarded;
    }

    @Transactional
    public Message mergeForwardMessages(List<Long> messageIds, Long senderId,
                                         Long receiverId, Long groupId, Integer conversationType) {
        List<Message> originalMessages = messageRepository.findByIdIn(messageIds);
        StringBuilder mergedContent = new StringBuilder();
        for (Message msg : originalMessages) {
            if (msg.getStatus() == 2) continue;
            User sender = userRepository.findById(msg.getSenderId()).orElse(null);
            String senderName = sender != null ? sender.getNickname() : "用户";
            mergedContent.append("[").append(senderName).append("]: ");
            if (msg.getMessageType() == 1) {
                mergedContent.append(msg.getContent());
            } else if (msg.getMessageType() == 2) {
                mergedContent.append("[图片]");
            } else if (msg.getMessageType() == 3) {
                mergedContent.append("[表情]");
            } else if (msg.getMessageType() == 4) {
                mergedContent.append("[文件: ").append(msg.getFileName()).append("]");
            }
            mergedContent.append("\n");
        }
        Message merged = sendMessage(senderId, receiverId, groupId, conversationType, 1, mergedContent.toString(), null);
        return merged;
    }

    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByIsTopDescUpdatedAtDesc(userId);
    }

    @Transactional
    public Conversation setTopConversation(Long userId, String conversationId, boolean isTop) {
        Conversation conv = conversationRepository.findByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        conv.setIsTop(isTop ? 1 : 0);
        return conversationRepository.save(conv);
    }

    @Transactional
    public Conversation setMuteConversation(Long userId, String conversationId, boolean isMute) {
        Conversation conv = conversationRepository.findByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        conv.setIsMute(isMute ? 1 : 0);
        return conversationRepository.save(conv);
    }

    @Transactional
    public void markConversationRead(Long userId, String conversationId) {
        Conversation conv = conversationRepository.findByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        conv.setUnreadCount(0);
        conversationRepository.save(conv);
    }

    @Transactional
    public void deleteConversation(Long userId, String conversationId) {
        conversationRepository.deleteByUserIdAndConversationId(userId, conversationId);
    }

    private String generateConversationId(Integer type, Long senderId, Long receiverId, Long groupId) {
        if (type == 1) {
            Long min = Math.min(senderId, receiverId);
            Long max = Math.max(senderId, receiverId);
            return "user_" + min + "_" + max;
        } else {
            return "group_" + groupId;
        }
    }

    private void updateConversations(String conversationId, Integer type, Long senderId, 
                                     Long receiverId, Long groupId, Long messageId) {
        if (type == 1) {
            updateConversation(senderId, conversationId, type, receiverId, messageId, 0);
            updateConversation(receiverId, conversationId, type, senderId, messageId, 1);
        } else {
            updateConversation(senderId, conversationId, type, groupId, messageId, 0);
        }
    }

    private void updateConversation(Long userId, String conversationId, Integer type, 
                                    Long targetId, Long messageId, int unreadIncrement) {
        Conversation conv = conversationRepository.findByUserIdAndConversationId(userId, conversationId)
                .orElse(new Conversation());
        if (conv.getId() == null) {
            conv.setUserId(userId);
            conv.setConversationId(conversationId);
            conv.setConversationType(type);
            conv.setTargetId(targetId);
            conv.setUnreadCount(0);
            conv.setIsTop(0);
            conv.setIsMute(0);
        }
        conv.setLastMessageId(messageId);
        conv.setUnreadCount(conv.getUnreadCount() + unreadIncrement);
        conversationRepository.save(conv);
    }
}
