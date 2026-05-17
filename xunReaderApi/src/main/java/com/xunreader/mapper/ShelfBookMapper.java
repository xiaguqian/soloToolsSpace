package com.xunreader.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunreader.entity.ShelfBook;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ShelfBookMapper extends BaseMapper<ShelfBook> {
    List<ShelfBook> selectByGroupId(Long groupId);
}