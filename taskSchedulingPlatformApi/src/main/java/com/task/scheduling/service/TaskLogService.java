package com.task.scheduling.service;

import com.task.scheduling.entity.TaskLog;
import com.task.scheduling.enums.TaskType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TaskLogService {
    
    private final Map<String, TaskLog> logs = new ConcurrentHashMap<>();
    
    public TaskLog save(TaskLog taskLog) {
        taskLog.setId(UUID.randomUUID().toString().replace("-", ""));
        logs.put(taskLog.getId(), taskLog);
        return taskLog;
    }
    
    public TaskLog findById(String id) {
        return logs.get(id);
    }
    
    public List<TaskLog> findByJobId(String jobId) {
        return logs.values().stream()
                .filter(log -> jobId.equals(log.getJobId()))
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
    
    public List<TaskLog> findByJobName(String jobName) {
        return logs.values().stream()
                .filter(log -> jobName != null && jobName.equals(log.getJobName()))
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
    
    public List<TaskLog> findByDate(LocalDate date) {
        if (date == null) {
            return new ArrayList<>();
        }
        return logs.values().stream()
                .filter(log -> log.getStartTime() != null 
                        && log.getStartTime().toLocalDate().equals(date))
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
    
    public List<TaskLog> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return logs.values().stream()
                .filter(log -> {
                    LocalDateTime logTime = log.getStartTime();
                    if (logTime == null) return false;
                    boolean afterStart = start == null || !logTime.isBefore(start);
                    boolean beforeEnd = end == null || !logTime.isAfter(end);
                    return afterStart && beforeEnd;
                })
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
    
    public List<TaskLog> findByTaskType(TaskType taskType) {
        return logs.values().stream()
                .filter(log -> taskType != null && taskType.equals(log.getTaskType()))
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
    
    public List<TaskLog> findAll() {
        return logs.values().stream()
                .sorted(Comparator.comparing(TaskLog::getStartTime).reversed())
                .collect(Collectors.toList());
    }
}
