
package com.example.im.repository;

import com.example.im.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdAndReceiverIdOrderByCreatedAtAsc(Long senderId, Long receiverId);
    List<Message> findByGroupIdOrderByCreatedAtAsc(Long groupId);
    List<Message> findByReceiverIdOrderByCreatedAtAsc(Long receiverId);
    List<Message> findByGroupId(Long groupId);
}
