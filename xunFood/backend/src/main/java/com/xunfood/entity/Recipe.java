package com.xunfood.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("recipe")
public class Recipe {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String cover;
    private Integer difficulty;
    private Integer cookTime;
    private Integer serving;
    private String ingredients;
    private String steps;
    private String media;
    private Integer likeCount;
    private Integer favoriteCount;
    private Integer viewCount;
    private Integer status;
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private User author;

    @TableField(exist = false)
    private Boolean liked;

    @TableField(exist = false)
    private Boolean favorited;

    @TableField(exist = false)
    private List<MediaItem> mediaList;

    @TableField(exist = false)
    private List<Ingredient> ingredientList;

    @TableField(exist = false)
    private List<Step> stepList;

    @Data
    public static class MediaItem {
        private String type;
        private String url;
        private String thumbnail;
    }

    @Data
    public static class Ingredient {
        private String name;
        private String amount;
    }

    @Data
    public static class Step {
        private Integer order;
        private String description;
        private String image;
        private Integer duration;
    }
}
