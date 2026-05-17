package com.xunreader.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunreader.entity.ReadingHistory;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReadingHistoryMapper extends BaseMapper<ReadingHistory> {
    List<ReadingHistory> selectByUserId(Long userId);
}