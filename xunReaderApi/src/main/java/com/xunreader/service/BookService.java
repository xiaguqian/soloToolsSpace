package com.xunreader.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xunreader.entity.Book;
import com.xunreader.entity.BookChapter;
import com.xunreader.mapper.BookChapterMapper;
import com.xunreader.mapper.BookMapper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookService {

    private final BookMapper bookMapper;
    private final BookChapterMapper chapterMapper;
    private final CacheService cacheService;

    public BookService(BookMapper bookMapper, BookChapterMapper chapterMapper, CacheService cacheService) {
        this.bookMapper = bookMapper;
        this.chapterMapper = chapterMapper;
        this.cacheService = cacheService;
    }

    public IPage<Book> searchBooks(int page, int size, String category, String keyword) {
        Page<Book> pageParam = new Page<>(page, size);
        IPage<Book> result = bookMapper.searchBooks(pageParam, category, keyword);
        result.getRecords().forEach(this::formatUpdateTime);
        return result;
    }

    public Book getBookById(Long bookId) {
        String cacheKey = "book:" + bookId;
        Object cached = cacheService.get(cacheKey);
        if (cached != null) {
            return (Book) cached;
        }
        
        Book book = bookMapper.selectById(bookId);
        if (book != null) {
            formatUpdateTime(book);
            cacheService.set(cacheKey, book);
        }
        return book;
    }

    public List<BookChapter> getChaptersByBookId(Long bookId) {
        String cacheKey = "chapters:" + bookId;
        Object cached = cacheService.get(cacheKey);
        if (cached != null) {
            return (List<BookChapter>) cached;
        }
        
        List<BookChapter> chapters = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            List<BookChapter> part = chapterMapper.selectByBookIdWithTable(bookId, i);
            if (part != null) {
                chapters.addAll(part);
            }
        }
        
        if (!chapters.isEmpty()) {
            cacheService.set(cacheKey, chapters);
        }
        return chapters;
    }

    public BookChapter getChapterById(Long chapterId) {
        for (int i = 0; i < 5; i++) {
            BookChapter chapter = chapterMapper.selectByIdWithTable(chapterId, i);
            if (chapter != null) {
                return chapter;
            }
        }
        return null;
    }

    public void updateBook(Book book) {
        bookMapper.updateById(book);
        cacheService.delete("book:" + book.getId());
    }

    public void deleteBook(Long bookId) {
        bookMapper.deleteById(bookId);
        cacheService.delete("book:" + bookId);
        cacheService.delete("chapters:" + bookId);
    }

    private void formatUpdateTime(Book book) {
        if (book.getUpdatedAt() != null) {
            book.setUpdateTime(book.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
    }
}