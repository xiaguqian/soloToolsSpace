package com.task.repository;

import com.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByJobId(String jobId);
    List<Task> findByStatus(Task.TaskStatus status);
    List<Task> findByEnabledTrue();
    boolean existsByJobId(String jobId);
    void deleteByJobId(String jobId);
}
