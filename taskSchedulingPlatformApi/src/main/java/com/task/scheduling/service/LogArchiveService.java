package com.task.scheduling.service;

import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.enums.TaskStatus;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class LogArchiveService {
    
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    
    public TaskExecutionResult execute(Map<String, Object> parameters) {
        String logDir = (String) parameters.get("logDir");
        String backupDir = (String) parameters.get("backupDir");
        
        if (logDir == null || logDir.isEmpty()) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("缺少必要参数: logDir")
                    .exitCode(-1)
                    .build();
        }
        
        if (backupDir == null || backupDir.isEmpty()) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("缺少必要参数: backupDir")
                    .exitCode(-1)
                    .build();
        }
        
        Path sourcePath = Paths.get(logDir);
        Path backupPath = Paths.get(backupDir);
        
        if (!Files.exists(sourcePath)) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("日志目录不存在: " + logDir)
                    .exitCode(-1)
                    .build();
        }
        
        if (!Files.isDirectory(sourcePath)) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("logDir 不是目录: " + logDir)
                    .exitCode(-1)
                    .build();
        }
        
        try {
            Files.createDirectories(backupPath);
            
            String timestamp = LocalDateTime.now().format(DATE_FORMAT);
            String zipFileName = "logs_archive_" + timestamp + ".zip";
            Path zipPath = backupPath.resolve(zipFileName);
            
            int archivedCount = 0;
            
            try (FileOutputStream fos = new FileOutputStream(zipPath.toFile());
                 ZipOutputStream zos = new ZipOutputStream(fos)) {
                
                try (DirectoryStream<Path> stream = Files.newDirectoryStream(sourcePath)) {
                    for (Path file : stream) {
                        if (Files.isRegularFile(file)) {
                            ZipEntry zipEntry = new ZipEntry(file.getFileName().toString());
                            zos.putNextEntry(zipEntry);
                            Files.copy(file, zos);
                            zos.closeEntry();
                            archivedCount++;
                        }
                    }
                }
            }
            
            int deletedCount = 0;
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(sourcePath)) {
                for (Path file : stream) {
                    if (Files.isRegularFile(file)) {
                        Files.delete(file);
                        deletedCount++;
                    }
                }
            }
            
            StringBuilder output = new StringBuilder();
            output.append("日志归档完成\n");
            output.append("源目录: ").append(logDir).append("\n");
            output.append("备份文件: ").append(zipPath.toAbsolutePath()).append("\n");
            output.append("归档文件数: ").append(archivedCount).append("\n");
            output.append("删除源文件数: ").append(deletedCount).append("\n");
            
            return TaskExecutionResult.builder()
                    .status(TaskStatus.SUCCESS)
                    .output(output.toString())
                    .errorMessage("")
                    .exitCode(0)
                    .build();
                    
        } catch (Exception e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("日志归档失败: " + e.getMessage())
                    .exitCode(-1)
                    .build();
        }
    }
}
