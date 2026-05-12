package com.soloim.repository;

import com.soloim.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByToUserIdOrderByCreatedAtDesc(Long toUserId);
    List<FriendRequest> findByToUserIdAndStatusOrderByCreatedAtDesc(Long toUserId, Integer status);
    Optional<FriendRequest> findByFromUserIdAndToUserIdAndStatus(Long fromUserId, Long toUserId, Integer status);
}
