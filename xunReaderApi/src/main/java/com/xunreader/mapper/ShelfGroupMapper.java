package com.xunreader.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunreader.entity.ShelfGroup;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ShelfGroupMapper extends BaseMapper<ShelfGroup> {
    List<ShelfGroup> selectByUserId(Long userId);
}