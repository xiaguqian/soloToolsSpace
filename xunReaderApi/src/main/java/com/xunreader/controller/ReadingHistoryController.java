package com.xunreader.controller;

import com.xunreader.entity.ReadingHistory;
import com.xunreader.service.ReadingHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/history")
public class ReadingHistoryController {

    private final ReadingHistoryService historyService;

    public ReadingHistoryController(ReadingHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<ReadingHistory>> getHistory() {
        List<ReadingHistory> history = historyService.getHistory(1L);
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> saveHistory(@RequestBody Map<String, Object> body) {
        Long bookId = ((Number) body.get("bookId")).longValue();
        Integer progress = (Integer) body.get("progress");
        historyService.saveHistory(1L, bookId, progress);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }
}