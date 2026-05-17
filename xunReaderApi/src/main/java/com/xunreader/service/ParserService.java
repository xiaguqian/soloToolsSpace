package com.xunreader.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ParserService {

    public Map<String, Object> parseUrl(String url) {
        Map<String, Object> result = new HashMap<>();
        
        if (url.contains("book")) {
            result.put("type", "book");
            Map<String, Object> book = new HashMap<>();
            book.put("id", 1L);
            book.put("name", "测试小说");
            book.put("author", "测试作者");
            book.put("cover", "https://example.com/cover.jpg");
            book.put("description", "这是一本测试小说");
            book.put("updateTime", "2024-01-01 12:00:00");
            book.put("isCompleted", 0);
            book.put("category", "玄幻");
            book.put("wordCount", 100000L);
            result.put("book", book);
        } else if (url.contains("store")) {
            result.put("type", "store");
            result.put("books", new Object[]{});
        } else if (url.contains("chapter")) {
            result.put("type", "chapter");
            result.put("chapterId", 1L);
            result.put("title", "第一章 初入江湖");
            result.put("content", "这是章节内容...");
        }
        
        return result;
    }
}