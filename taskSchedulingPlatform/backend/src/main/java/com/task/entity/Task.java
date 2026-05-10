package com.task.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sys_task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false, unique = true, length = 50)
    private String jobId;

    @Column(name = "job_name", nullable = false, length = 100)
    private String jobName;

    @Column(name = "job_group", length = 50)
    private String jobGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 30)
    private TaskType taskType;

    @Column(name = "cron_expression", length = 50)
    private String cronExpression;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false, length = 20)
    private ScheduleType scheduleType = ScheduleType.CRON;

    @Column(name = "fixed_rate")
    private Long fixedRate;

    @Column(name = "fixed_delay")
    private Long fixedDelay;

    @Column(name = "command_detail", columnDefinition = "TEXT")
    private String commandDetail;

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 60;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.STOPPED;

    @Column(name = "last_execute_time")
    private LocalDateTime lastExecuteTime;

    @Column(name = "next_execute_time")
    private LocalDateTime nextExecuteTime;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "create_by", length = 50)
    private String createBy;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    public enum TaskType {
        LOCAL_SHELL,
        LOCAL_CODE,
        REMOTE_HTTP
    }

    public enum TaskStatus {
        RUNNING,
        STOPPED,
        PAUSED
    }

    public enum ScheduleType {
        CRON,
        FIXED_RATE,
        FIXED_DELAY
    }
}
