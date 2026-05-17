package com.xunreader.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("shelf_books")
public class ShelfBook {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long groupId;
    private Long bookId;
    private LocalDateTime createdAt;
}