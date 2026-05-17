package com.xunreader.service;

import com.xunreader.entity.Book;
import com.xunreader.entity.ShelfBook;
import com.xunreader.entity.ShelfGroup;
import com.xunreader.mapper.BookMapper;
import com.xunreader.mapper.ShelfBookMapper;
import com.xunreader.mapper.ShelfGroupMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ShelfService {

    private final ShelfGroupMapper groupMapper;
    private final ShelfBookMapper bookMapper;
    private final BookMapper bookInfoMapper;

    public ShelfService(ShelfGroupMapper groupMapper, ShelfBookMapper bookMapper, BookMapper bookInfoMapper) {
        this.groupMapper = groupMapper;
        this.bookMapper = bookMapper;
        this.bookInfoMapper = bookInfoMapper;
    }

    public List<ShelfGroup> getShelfGroups(Long userId) {
        return groupMapper.selectByUserId(userId);
    }

    @Transactional
    public void updateShelfGroups(List<ShelfGroup> groups, Long userId) {
        List<ShelfGroup> existingGroups = groupMapper.selectByUserId(userId);
        
        for (ShelfGroup group : groups) {
            group.setUserId(userId);
            if (group.getId() != null) {
                groupMapper.updateById(group);
                List<ShelfBook> existingBooks = bookMapper.selectByGroupId(group.getId());
                for (ShelfBook existingBook : existingBooks) {
                    bookMapper.deleteById(existingBook.getId());
                }
            } else {
                groupMapper.insert(group);
            }
            
            if (group.getId() != null && group.getBooks() != null) {
                for (Long bookId : group.getBooks()) {
                    ShelfBook shelfBook = new ShelfBook();
                    shelfBook.setGroupId(group.getId());
                    shelfBook.setBookId(bookId);
                    bookMapper.insert(shelfBook);
                }
            }
        }
    }

    public List<Book> getBooksInGroup(Long groupId) {
        List<ShelfBook> shelfBooks = bookMapper.selectByGroupId(groupId);
        List<Book> books = new ArrayList<>();
        for (ShelfBook shelfBook : shelfBooks) {
            Book book = bookInfoMapper.selectById(shelfBook.getBookId());
            if (book != null) {
                books.add(book);
            }
        }
        return books;
    }
}