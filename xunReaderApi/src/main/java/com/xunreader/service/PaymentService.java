package com.xunreader.service;

import com.xunreader.entity.PaymentStatus;
import com.xunreader.mapper.PaymentStatusMapper;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentStatusMapper paymentMapper;

    public PaymentService(PaymentStatusMapper paymentMapper) {
        this.paymentMapper = paymentMapper;
    }

    public PaymentStatus getPaymentStatus(Long userId) {
        PaymentStatus status = paymentMapper.selectByUserId(userId);
        if (status == null) {
            status = new PaymentStatus();
            status.setUserId(userId);
            status.setIsPaid(0);
        }
        return status;
    }

    public List<String> getFeatures(Long userId) {
        PaymentStatus status = getPaymentStatus(userId);
        if (status.getIsPaid() != null && status.getIsPaid() == 1) {
            return Arrays.asList("full_access", "no_ads", "offline_read");
        }
        return Arrays.asList("basic_access");
    }
}