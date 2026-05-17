package com.xunreader.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.xunreader.entity.Book;
import com.xunreader.entity.BookChapter;
import com.xunreader.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        
        IPage<Book> bookPage = bookService.searchBooks(page, size, category, keyword);
        Map<String, Object> result = new HashMap<>();
        result.put("list", bookPage.getRecords());
        result.put("total", bookPage.getTotal());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<Map<String, Object>> getBook(@PathVariable Long bookId) {
        Book book = bookService.getBookById(bookId);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<BookChapter> chapters = bookService.getChaptersByBookId(bookId);
        Map<String, Object> result = new HashMap<>();
        result.put("id", book.getId());
        result.put("name", book.getName());
        result.put("author", book.getAuthor());
        result.put("cover", book.getCover());
        result.put("description", book.getDescription());
        result.put("updateTime", book.getUpdateTime());
        result.put("isCompleted", book.getIsCompleted());
        result.put("category", book.getCategory());
        result.put("wordCount", book.getWordCount());
        result.put("chapters", chapters.stream().map(chapter -> {
            Map<String, Object> c = new HashMap<>();
            c.put("id", chapter.getId());
            c.put("title", chapter.getTitle());
            c.put("wordCount", chapter.getWordCount());
            return c;
        }).toList());
        
        return ResponseEntity.ok(result);
    }
}