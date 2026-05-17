package com.xunreader.service;

import com.xunreader.entity.ReadingHistory;
import com.xunreader.mapper.ReadingHistoryMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReadingHistoryService {

    private final ReadingHistoryMapper historyMapper;

    public ReadingHistoryService(ReadingHistoryMapper historyMapper) {
        this.historyMapper = historyMapper;
    }

    public List<ReadingHistory> getHistory(Long userId) {
        return historyMapper.selectByUserId(userId);
    }

    public void saveHistory(Long userId, Long bookId, Integer progress) {
        ReadingHistory history = historyMapper.selectByUserId(userId).stream()
                .filter(h -> h.getBookId().equals(bookId))
                .findFirst()
                .orElse(null);

        if (history != null) {
            history.setProgress(progress);
            history.setReadTime(LocalDateTime.now());
            historyMapper.updateById(history);
        }
    }

    public void addHistory(ReadingHistory history) {
        historyMapper.insert(history);
    }
}