package com.task.controller;

import com.task.common.Result;
import com.task.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping
    public Result<List<Map<String, Object>>> getAllLogs() {
        List<Map<String, Object>> logs = logService.getAllLogs();
        if (logs == null) {
            return Result.error(500, "获取日志失败，请检查远程服务是否可用");
        }
        return Result.success(logs);
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> getLogById(@PathVariable String id) {
        Map<String, Object> log = logService.getLogById(id);
        if (log == null) {
            return Result.error(404, "日志不存在");
        }
        return Result.success(log);
    }

    @GetMapping("/name/{jobName}")
    public Result<List<Map<String, Object>>> getLogsByJobName(@PathVariable String jobName) {
        List<Map<String, Object>> logs = logService.getLogsByJobName(jobName);
        if (logs == null) {
            return Result.error(500, "获取日志失败，请检查远程服务是否可用");
        }
        return Result.success(logs);
    }

    @GetMapping("/date/{date}")
    public Result<List<Map<String, Object>>> getLogsByDate(@PathVariable String date) {
        List<Map<String, Object>> logs = logService.getLogsByDate(date);
        if (logs == null) {
            return Result.error(500, "获取日志失败，请检查远程服务是否可用");
        }
        return Result.success(logs);
    }
}
