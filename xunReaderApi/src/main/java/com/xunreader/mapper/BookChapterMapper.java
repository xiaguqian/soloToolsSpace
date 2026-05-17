package com.xunreader.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xunreader.entity.BookChapter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BookChapterMapper extends BaseMapper<BookChapter> {
    @Select("SELECT * FROM book_chapters_${tableIndex} WHERE book_id = #{bookId} ORDER BY chapter_index")
    List<BookChapter> selectByBookIdWithTable(@Param("bookId") Long bookId, @Param("tableIndex") int tableIndex);

    @Select("SELECT * FROM book_chapters_${tableIndex} WHERE id = #{id}")
    BookChapter selectByIdWithTable(@Param("id") Long id, @Param("tableIndex") int tableIndex);
}