package com.soloim.repository;

import com.soloim.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserIdOrderByIsTopDescUpdatedAtDesc(Long userId);
    Optional<Conversation> findByUserIdAndConversationId(Long userId, String conversationId);
    void deleteByUserIdAndConversationId(Long userId, String conversationId);
}
