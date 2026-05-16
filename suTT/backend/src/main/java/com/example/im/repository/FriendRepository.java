
package com.example.im.repository;

import com.example.im.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {
    List<Friend> findByUserId(Long userId);
    List<Friend> findByUserIdAndGroupName(Long userId, String groupName);
    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);
    List<Friend> findByUserIdAndStatus(Long userId, Integer status);
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
}
