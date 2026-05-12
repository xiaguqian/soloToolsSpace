package com.soloim.repository;

import com.soloim.entity.FriendGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendGroupRepository extends JpaRepository<FriendGroup, Long> {
    List<FriendGroup> findByUserIdOrderBySortOrderAsc(Long userId);
    Optional<FriendGroup> findByUserIdAndGroupName(Long userId, String groupName);
    Optional<FriendGroup> findByUserIdAndIsDefault(Long userId, Integer isDefault);
}
