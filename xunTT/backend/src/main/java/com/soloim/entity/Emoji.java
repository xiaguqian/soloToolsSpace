package com.soloim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "t_emoji")
public class Emoji {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "emoji_name", nullable = false, length = 50)
    private String emojiName;

    @Column(name = "emoji_url", nullable = false, length = 500)
    private String emojiUrl;

    @Column(name = "is_system", nullable = false, columnDefinition = "TINYINT DEFAULT 0")
    private Integer isSystem = 0;

    @Column(name = "sort_order", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
