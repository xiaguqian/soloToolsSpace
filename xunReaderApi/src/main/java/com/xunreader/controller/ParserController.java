package com.xunreader.controller;

import com.xunreader.service.ParserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/parser")
public class ParserController {

    private final ParserService parserService;

    public ParserController(ParserService parserService) {
        this.parserService = parserService;
    }

    @PostMapping("/url")
    public ResponseEntity<Map<String, Object>> parseUrl(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        Map<String, Object> result = parserService.parseUrl(url);
        return ResponseEntity.ok(result);
    }
}