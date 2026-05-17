package com.xunreader.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("book_chapters")
public class BookChapter {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long bookId;
    private Integer chapterIndex;
    private String title;
    private Integer wordCount;
    private String contentPath;
    private String storageType;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}