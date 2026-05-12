package com.soloim.repository;

import com.soloim.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);
    List<Friend> findByUserIdAndStatus(Long userId, Integer status);
    List<Friend> findByUserIdAndGroupId(Long userId, Long groupId);
    boolean existsByUserIdAndFriendIdAndStatus(Long userId, Long friendId, Integer status);
}
