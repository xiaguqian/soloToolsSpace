
package com.example.im.repository;

import com.example.im.entity.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlacklistRepository extends JpaRepository<Blacklist, Long> {
    Optional<Blacklist> findByUserIdAndTargetId(Long userId, Long targetId);
    List<Blacklist> findByUserId(Long userId);
    boolean existsByUserIdAndTargetId(Long userId, Long targetId);
}
