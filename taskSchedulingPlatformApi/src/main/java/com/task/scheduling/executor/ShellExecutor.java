package com.task.scheduling.executor;

import com.task.scheduling.config.ShellProperties;
import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.util.TemplateResolver;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.*;

@Component
public class ShellExecutor {
    
    private final ShellProperties shellProperties;
    private final TemplateResolver templateResolver;
    
    public ShellExecutor(ShellProperties shellProperties, TemplateResolver templateResolver) {
        this.shellProperties = shellProperties;
        this.templateResolver = templateResolver;
    }
    
    public TaskExecutionResult execute(String command, String jobId, Map<String, Object> parameters, int timeoutSeconds) {
        String resolvedCommand = templateResolver.resolve(command, jobId, parameters);
        
        TaskExecutionResult securityCheck = checkSecurity(resolvedCommand);
        if (securityCheck != null) {
            return securityCheck;
        }
        
        int timeout = timeoutSeconds > 0 ? timeoutSeconds : shellProperties.getTimeoutSeconds();
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<TaskExecutionResult> future = executor.submit(() -> runCommand(resolvedCommand));
        
        try {
            return future.get(timeout, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            return TaskExecutionResult.builder()
                    .status(TaskStatus.TIMEOUT)
                    .output("")
                    .errorMessage("执行超时，已超过 " + timeout + " 秒")
                    .exitCode(-1)
                    .build();
        } catch (Exception e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("执行异常: " + e.getMessage())
                    .exitCode(-1)
                    .build();
        } finally {
            executor.shutdownNow();
        }
    }
    
    private TaskExecutionResult checkSecurity(String command) {
        String os = System.getProperty("os.name").toLowerCase();
        boolean isWindows = os.contains("win");
        
        if (shellProperties.getBlacklist() != null) {
            for (String blacklistItem : shellProperties.getBlacklist()) {
                if (command.toLowerCase().contains(blacklistItem.toLowerCase())) {
                    return TaskExecutionResult.builder()
                            .status(TaskStatus.SECURITY_REJECTED)
                            .output("")
                            .errorMessage("安全检查失败: 命令包含危险模式 - " + blacklistItem)
                            .exitCode(-1)
                            .build();
                }
            }
        }
        
        String executable = extractExecutable(command);
        if (executable != null && !isSystemCommand(executable)) {
            String allowedExts = isWindows ? ".cmd, .bat" : ".sh";
            boolean validExtension = isWindows ? 
                    (executable.endsWith(".cmd") || executable.endsWith(".bat")) :
                    executable.endsWith(".sh");
            
            if (!validExtension) {
                return TaskExecutionResult.builder()
                        .status(TaskStatus.SECURITY_REJECTED)
                        .output("")
                        .errorMessage("安全检查失败: " + (isWindows ? "Windows" : "Linux") + 
                                " 系统仅允许执行 " + allowedExts + " 文件，当前文件: " + executable)
                        .exitCode(-1)
                        .build();
            }
        }
        
        String trustedDir = shellProperties.getTrustedDir();
        if (trustedDir != null && !trustedDir.isEmpty()) {
            String trimmedDir = trustedDir.endsWith("/") ? trustedDir : trustedDir + "/";
            boolean startsWithTrusted = command.startsWith(trimmedDir);
            boolean usesTrustedInPath = command.contains(trimmedDir);
            
            if (!startsWithTrusted && !usesTrustedInPath) {
                File scriptFile = new File(command.split("\\s+")[0]);
                if (!scriptFile.isAbsolute()) {
                    scriptFile = new File(trustedDir, scriptFile.getName());
                }
                if (!scriptFile.getAbsolutePath().startsWith(new File(trustedDir).getAbsolutePath())) {
                    return TaskExecutionResult.builder()
                            .status(TaskStatus.SECURITY_REJECTED)
                            .output("")
                            .errorMessage("安全检查失败: 脚本必须位于受信任目录 " + trustedDir)
                            .exitCode(-1)
                            .build();
                }
            }
        }
        
        return null;
    }
    
    private String extractExecutable(String command) {
        if (command == null || command.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = command.trim();
        String[] parts = trimmed.split("\\s+");
        if (parts.length == 0) {
            return null;
        }
        
        String firstPart = parts[0];
        
        String os = System.getProperty("os.name").toLowerCase();
        boolean isWindows = os.contains("win");
        
        if (isWindows) {
            if (firstPart.equalsIgnoreCase("cmd.exe") || 
                firstPart.equalsIgnoreCase("cmd") ||
                firstPart.equalsIgnoreCase("powershell.exe") ||
                firstPart.equalsIgnoreCase("powershell")) {
                if (parts.length >= 3) {
                    return parts[2];
                }
            }
        } else {
            if (firstPart.equalsIgnoreCase("sh") || 
                firstPart.equalsIgnoreCase("bash") ||
                firstPart.equalsIgnoreCase("/bin/sh") ||
                firstPart.equalsIgnoreCase("/bin/bash")) {
                if (parts.length >= 2) {
                    return parts[1];
                }
            }
        }
        
        return firstPart;
    }
    
    private boolean isSystemCommand(String command) {
        if (command == null) return false;
        String lower = command.toLowerCase();
        
        String os = System.getProperty("os.name").toLowerCase();
        boolean isWindows = os.contains("win");
        
        if (isWindows) {
            return lower.equals("echo") || lower.equals("dir") || lower.equals("cd") ||
                   lower.equals("set") || lower.equals("cls") || lower.equals("type") ||
                   lower.equals("copy") || lower.equals("del") || lower.equals("move") ||
                   lower.equals("mkdir") || lower.equals("rmdir") || lower.equals("ren") ||
                   lower.equals("where") || lower.equals("tasklist") || lower.equals("taskkill") ||
                   lower.equals("netstat") || lower.equals("ipconfig") || lower.equals("ping") ||
                   lower.equals("find") || lower.equals("findstr") || lower.equals("sort") ||
                   lower.equals("more") || lower.equals("chcp") || lower.equals("ver") ||
                   lower.equals("cmd.exe") || lower.equals("cmd") ||
                   lower.equals("powershell.exe") || lower.equals("powershell");
        } else {
            return lower.equals("echo") || lower.equals("ls") || lower.equals("cd") ||
                   lower.equals("pwd") || lower.equals("cat") || lower.equals("grep") ||
                   lower.equals("awk") || lower.equals("sed") || lower.equals("ps") ||
                   lower.equals("kill") || lower.equals("netstat") || lower.equals("ifconfig") ||
                   lower.equals("ip") || lower.equals("ping") || lower.equals("curl") ||
                   lower.equals("wget") || lower.equals("find") || lower.equals("sort") ||
                   lower.equals("head") || lower.equals("tail") || lower.equals("wc") ||
                   lower.equals("uniq") || lower.equals("cut") || lower.equals("tr") ||
                   lower.equals("date") || lower.equals("uptime") || lower.equals("who") ||
                   lower.equals("which") || lower.equals("whereis") || lower.equals("whatis") ||
                   lower.equals("sh") || lower.equals("bash") || lower.equals("/bin/sh") ||
                   lower.equals("/bin/bash") || lower.equals("/usr/bin/env");
        }
    }
    
    private TaskExecutionResult runCommand(String command) {
        Process process = null;
        try {
            ProcessBuilder pb = new ProcessBuilder();
            pb.redirectErrorStream(true);
            
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                pb.command("cmd.exe", "/c", command);
            } else {
                pb.command("sh", "-c", command);
            }
            
            process = pb.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            
            String outputStr = output.toString();
            if (outputStr.length() > 10000) {
                outputStr = outputStr.substring(0, 10000) + "\n... (output truncated)";
            }
            
            return TaskExecutionResult.builder()
                    .status(exitCode == 0 ? TaskStatus.SUCCESS : TaskStatus.FAILED)
                    .output(outputStr)
                    .errorMessage(exitCode == 0 ? "" : "命令执行失败，退出码: " + exitCode)
                    .exitCode(exitCode)
                    .build();
                    
        } catch (Exception e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("执行异常: " + e.getMessage())
                    .exitCode(-1)
                    .build();
        } finally {
            if (process != null) {
                process.destroyForcibly();
            }
        }
    }
}
