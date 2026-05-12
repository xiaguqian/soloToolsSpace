package com.soloim.repository;

import com.soloim.entity.Emoji;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmojiRepository extends JpaRepository<Emoji, Long> {
    List<Emoji> findByIsSystemOrderBySortOrderAsc(Integer isSystem);
    List<Emoji> findByUserIdOrIsSystemOrderBySortOrderAsc(Long userId, Integer isSystem);
}
