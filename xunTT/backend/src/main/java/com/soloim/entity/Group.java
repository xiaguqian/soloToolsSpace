package com.soloim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "t_group")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name", nullable = false, length = 50)
    private String groupName;

    @Column(name = "group_avatar", length = 500)
    private String groupAvatar;

    @Column(name = "group_owner_id", nullable = false)
    private Long groupOwnerId;

    @Column(length = 500)
    private String announcement;

    @Column(name = "member_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer memberCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
