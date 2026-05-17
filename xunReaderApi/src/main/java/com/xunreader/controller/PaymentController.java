package com.xunreader.controller;

import com.xunreader.entity.PaymentStatus;
import com.xunreader.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus() {
        PaymentStatus status = paymentService.getPaymentStatus(1L);
        List<String> features = paymentService.getFeatures(1L);
        
        Map<String, Object> result = new HashMap<>();
        result.put("isPaid", status.getIsPaid());
        result.put("expiresAt", status.getExpiresAt());
        result.put("features", features);
        
        return ResponseEntity.ok(result);
    }
}