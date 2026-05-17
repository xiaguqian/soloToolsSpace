package com.xunreader.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("books")
public class Book {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String author;
    private String cover;
    private String description;
    private String category;
    private Long wordCount;
    private Integer isCompleted;
    private Integer status;
    private Long viewCount;
    private Long collectCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableField("author_id")
    private Long authorId;

    @TableField(exist = false)
    private String updateTime;
}