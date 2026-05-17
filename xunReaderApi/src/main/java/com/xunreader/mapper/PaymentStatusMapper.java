package com.xunreader.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunreader.entity.PaymentStatus;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentStatusMapper extends BaseMapper<PaymentStatus> {
    PaymentStatus selectByUserId(Long userId);
}