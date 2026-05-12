package com.xunfood.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String phone;
    private String username;
    private String nickname;
    private String password;
    private String avatar;
    private String bio;
    private Integer recipeCount;
    private Integer likeCount;
    private Integer favoriteCount;
    private Integer followerCount;
    private Integer followingCount;
    private Integer level;
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String levelName;

    @TableField(exist = false)
    private Boolean followed;

    public String getLevelName() {
        if (level == null) return "十指不沾阳春水";
        return switch (level) {
            case 0 -> "十指不沾阳春水";
            case 1 -> "家庭掌勺人";
            case 2 -> "厨神";
            default -> "十指不沾阳春水";
        };
    }
}
