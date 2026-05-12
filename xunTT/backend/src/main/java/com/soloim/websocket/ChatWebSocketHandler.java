package com.soloim.websocket;

import com.alibaba.fastjson2.JSON;
import com.soloim.entity.Message;
import com.soloim.repository.GroupMemberRepository;
import com.soloim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();
    
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            sessions.put(userId, session);
            userRepository.findById(userId).ifPresent(user -> {
                user.setIsOnline(1);
                userRepository.save(user);
            });
            log.info("用户 {} 连接 WebSocket", userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            String payload = message.getPayload();
            Map<String, Object> msgData = JSON.parseObject(payload);
            String type = (String) msgData.get("type");
            if ("pong".equals(type)) {
                return;
            }
            if ("message".equals(type)) {
                Message msg = JSON.parseObject(JSON.toJSONString(msgData.get("data")), Message.class);
                if (msg.getConversationType() == 1) {
                    sendToUser(msg.getSenderId(), payload);
                    sendToUser(msg.getReceiverId(), payload);
                } else {
                    sendToGroup(msg.getGroupId(), payload);
                }
            }
        } catch (Exception e) {
            log.error("处理消息失败", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            sessions.remove(userId);
            userRepository.findById(userId).ifPresent(user -> {
                user.setIsOnline(0);
                userRepository.save(user);
            });
            log.info("用户 {} 断开 WebSocket", userId);
        }
    }

    public void sendToUser(Long userId, String message) {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                log.error("发送消息给用户 {} 失败", userId, e);
            }
        }
    }

    public void sendToGroup(Long groupId, String message) {
        var members = groupMemberRepository.findByGroupId(groupId);
        for (var member : members) {
            sendToUser(member.getUserId(), message);
        }
    }

    public boolean isUserOnline(Long userId) {
        WebSocketSession session = sessions.get(userId);
        return session != null && session.isOpen();
    }
}
