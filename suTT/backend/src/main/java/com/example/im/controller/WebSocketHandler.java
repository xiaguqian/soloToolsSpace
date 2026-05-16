
package com.example.im.controller;

import com.example.im.config.JwtConfig;
import com.example.im.service.UserService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class WebSocketHandler implements ChannelInterceptor {

    private final JwtConfig jwtConfig;
    private final UserService userService;

    public WebSocketHandler(JwtConfig jwtConfig, UserService userService) {
        this.jwtConfig = jwtConfig;
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                Long userId = jwtConfig.validateTokenAndGetUserId(token);
                if (userId != null) {
                    userService.updateOnlineStatus(userId, true);
                    accessor.getSessionAttributes().put("userId", userId);
                }
            }
        }
        
        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            Object userId = accessor.getSessionAttributes().get("userId");
            if (userId != null) {
                userService.updateOnlineStatus((Long) userId, false);
            }
        }
        
        return message;
    }
}
