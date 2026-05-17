package com.xunreader.controller;

import com.xunreader.entity.Book;
import com.xunreader.entity.ShelfGroup;
import com.xunreader.service.ShelfService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shelf")
public class ShelfController {

    private final ShelfService shelfService;

    public ShelfController(ShelfService shelfService) {
        this.shelfService = shelfService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getShelf() {
        List<ShelfGroup> groups = shelfService.getShelfGroups(1L);
        
        List<Map<String, Object>> result = groups.stream().map(group -> {
            Map<String, Object> g = new HashMap<>();
            g.put("id", group.getId());
            g.put("name", group.getName());
            g.put("isDefault", group.getIsDefault());
            g.put("books", shelfService.getBooksInGroup(group.getId()).stream().map(book -> {
                Map<String, Object> b = new HashMap<>();
                b.put("id", book.getId());
                b.put("name", book.getName());
                b.put("author", book.getAuthor());
                b.put("cover", book.getCover());
                return b;
            }).toList());
            return g;
        }).toList();
        
        return ResponseEntity.ok(result);
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateShelf(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> groups = (List<Map<String, Object>>) body.get("groups");
        shelfService.updateShelfGroups(groups.stream().map(g -> {
            ShelfGroup group = new ShelfGroup();
            if (g.get("id") != null) {
                group.setId(((Number) g.get("id")).longValue());
            }
            group.setName((String) g.get("name"));
            group.setIsDefault((Integer) g.get("isDefault"));
            if (g.get("books") != null) {
                group.setBooks(((List<Number>) g.get("books")).stream().map(Number::longValue).toList());
            }
            return group;
        }).toList(), 1L);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "success");
        return ResponseEntity.ok(result);
    }
}