
package com.example.im.repository;

import com.example.im.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findByTargetAndCode(String target, String code);
    List<VerificationCode> findByTargetOrderByCreatedAtDesc(String target);
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
