package com.xunreader.controller;

import com.xunreader.entity.Book;
import com.xunreader.entity.BookChapter;
import com.xunreader.entity.Role;
import com.xunreader.entity.User;
import com.xunreader.service.BookService;
import com.xunreader.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final BookService bookService;
    private final UserService userService;

    public AdminController(BookService bookService, UserService userService) {
        this.bookService = bookService;
        this.userService = userService;
    }

    @GetMapping("/books")
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.searchBooks(1, Integer.MAX_VALUE, null, null).getRecords());
    }

    @PutMapping("/books/{bookId}/status")
    public ResponseEntity<Map<String, String>> updateBookStatus(@PathVariable Long bookId, @RequestBody Map<String, Integer> body) {
        Book book = bookService.getBookById(bookId);
        if (book != null) {
            book.setStatus(body.get("status"));
            bookService.updateBook(book);
        }
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/books/{bookId}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long bookId) {
        Book book = bookService.getBookById(bookId);
        if (book != null && !"author".equals(userService.getUserById(book.getAuthorId()).getRole())) {
            bookService.deleteBook(bookId);
        }
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/books/{bookId}/chapters")
    public ResponseEntity<List<BookChapter>> getBookChapters(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookService.getChaptersByBookId(bookId));
    }

    @PutMapping("/books/{bookId}/chapters/batch")
    public ResponseEntity<Map<String, String>> batchUpdateChapters(@PathVariable Long bookId, @RequestBody Map<String, Object> body) {
        List<Long> chapterIds = ((List<Number>) body.get("chapterIds")).stream().map(Number::longValue).toList();
        Integer status = (Integer) body.get("status");
        
        for (Long chapterId : chapterIds) {
            BookChapter chapter = bookService.getChapterById(chapterId);
            if (chapter != null) {
                chapter.setStatus(status);
            }
        }
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        userService.updateUserRole(userId, body.get("role"));
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<Map<String, String>> createRole(@RequestBody Role role) {
        userService.createRole(role);
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @PutMapping("/roles/{roleId}")
    public ResponseEntity<Map<String, String>> updateRole(@PathVariable Long roleId, @RequestBody Role role) {
        role.setId(roleId);
        userService.updateRole(role);
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/roles/{roleId}")
    public ResponseEntity<Map<String, String>> deleteRole(@PathVariable Long roleId) {
        userService.deleteRole(roleId);
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }
}