
package com.example.im.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(name = "group_id")
    private Long groupId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType;

    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "reply_to")
    private Long replyTo;

    @Column(name = "is_recalled")
    private Boolean isRecalled = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
