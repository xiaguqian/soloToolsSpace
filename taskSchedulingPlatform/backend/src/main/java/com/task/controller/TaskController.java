package com.task.controller;

import com.task.common.Result;
import com.task.entity.Task;
import com.task.service.TaskService;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public Result<List<Task>> list() {
        List<Task> tasks = taskService.findAll();
        return Result.success(tasks);
    }

    @GetMapping("/{id}")
    public Result<Task> getById(@PathVariable Long id) {
        Optional<Task> taskOpt = taskService.findById(id);
        if (!taskOpt.isPresent()) {
            return Result.error(404, "任务不存在");
        }
        return Result.success(taskOpt.get());
    }

    @PostMapping
    public Result<Task> create(@RequestBody Task task) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Task savedTask = taskService.create(task, username);
            return Result.success("创建成功", savedTask);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Task> update(@PathVariable Long id, @RequestBody Task taskDetails) {
        try {
            Task updatedTask = taskService.update(id, taskDetails);
            return Result.success("更新成功", updatedTask);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        try {
            taskService.delete(id);
            return Result.success("删除成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/start")
    public Result<Task> start(@PathVariable Long id) {
        try {
            Task task = taskService.startTask(id);
            return Result.success("启动成功", task);
        } catch (SchedulerException e) {
            return Result.error(500, "调度器异常: " + e.getMessage());
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/stop")
    public Result<Task> stop(@PathVariable Long id) {
        try {
            Task task = taskService.stopTask(id);
            return Result.success("停止成功", task);
        } catch (SchedulerException e) {
            return Result.error(500, "调度器异常: " + e.getMessage());
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}/cron")
    public Result<Task> updateCron(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String cronExpression = request.get("cronExpression");
            if (cronExpression == null || cronExpression.isEmpty()) {
                return Result.error(400, "Cron表达式不能为空");
            }
            Task task = taskService.updateCron(id, cronExpression);
            return Result.success("更新成功", task);
        } catch (SchedulerException e) {
            return Result.error(500, "调度器异常: " + e.getMessage());
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
