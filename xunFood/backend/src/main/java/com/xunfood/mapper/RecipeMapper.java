package com.xunfood.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunfood.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RecipeMapper extends BaseMapper<Recipe> {
}
