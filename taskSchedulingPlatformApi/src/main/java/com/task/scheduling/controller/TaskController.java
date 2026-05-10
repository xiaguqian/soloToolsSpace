package com.task.scheduling.controller;

import com.task.scheduling.dto.TaskRequest;
import com.task.scheduling.entity.TaskLog;
import com.task.scheduling.service.TaskExecutionService;
import com.task.scheduling.service.TaskLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    
    private final TaskExecutionService taskExecutionService;
    private final TaskLogService taskLogService;
    
    public TaskController(TaskExecutionService taskExecutionService, TaskLogService taskLogService) {
        this.taskExecutionService = taskExecutionService;
        this.taskLogService = taskLogService;
    }
    
    @PostMapping("/execute")
    public ResponseEntity<TaskLog> executeTask(@Valid @RequestBody TaskRequest request) {
        TaskLog result = taskExecutionService.executeTask(request);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/logs")
    public ResponseEntity<List<TaskLog>> getAllLogs() {
        return ResponseEntity.ok(taskLogService.findAll());
    }
    
    @GetMapping("/logs/{id}")
    public ResponseEntity<TaskLog> getLogById(@PathVariable String id) {
        TaskLog log = taskLogService.findById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(log);
    }
    
    @GetMapping("/logs/job/{jobId}")
    public ResponseEntity<List<TaskLog>> getLogsByJobId(@PathVariable String jobId) {
        return ResponseEntity.ok(taskLogService.findByJobId(jobId));
    }
    
    @GetMapping("/logs/name/{jobName}")
    public ResponseEntity<List<TaskLog>> getLogsByJobName(@PathVariable String jobName) {
        return ResponseEntity.ok(taskLogService.findByJobName(jobName));
    }
    
    @GetMapping("/logs/date/{date}")
    public ResponseEntity<List<TaskLog>> getLogsByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(taskLogService.findByDate(localDate));
    }
}
