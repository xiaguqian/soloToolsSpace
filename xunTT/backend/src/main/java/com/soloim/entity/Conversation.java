package com.soloim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "t_conversation", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "conversation_id"})
})
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "conversation_id", nullable = false, length = 100)
    private String conversationId;

    @Column(name = "conversation_type", nullable = false)
    private Integer conversationType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "last_message_id")
    private Long lastMessageId;

    @Column(name = "unread_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer unreadCount = 0;

    @Column(name = "is_top", nullable = false, columnDefinition = "TINYINT DEFAULT 0")
    private Integer isTop = 0;

    @Column(name = "is_mute", nullable = false, columnDefinition = "TINYINT DEFAULT 0")
    private Integer isMute = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
