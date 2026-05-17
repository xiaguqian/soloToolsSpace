package com.xunreader.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reading_history")
public class ReadingHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookName;
    private String cover;
    private Integer progress;
    private LocalDateTime readTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}