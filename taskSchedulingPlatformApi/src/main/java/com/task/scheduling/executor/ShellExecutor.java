package com.task.scheduling.executor;

import com.task.scheduling.config.ShellProperties;
import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.util.TemplateResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.*;

@Component
public class ShellExecutor {
    
    private static final Logger logger = LoggerFactory.getLogger(ShellExecutor.class);
    
    private final ShellProperties shellProperties;
    private final TemplateResolver templateResolver;
    
    public ShellExecutor(ShellProperties shellProperties, TemplateResolver templateResolver) {
        this.shellProperties = shellProperties;
        this.templateResolver = templateResolver;
    }
    
    public TaskExecutionResult execute(String command, String jobId, Map<String, Object> parameters, int timeoutSeconds) {
        String resolvedCommand = templateResolver.resolve(command, jobId, parameters);
        logger.info("准备执行Shell命令: {}", resolvedCommand);
        
        TaskExecutionResult securityCheck = checkSecurity(resolvedCommand);
        if (securityCheck != null) {
            logger.warn("安全检查失败: {}", securityCheck.getErrorMessage());
            return securityCheck;
        }
        
        int timeout = timeoutSeconds > 0 ? timeoutSeconds : shellProperties.getTimeoutSeconds();
        ExecutorService executor = Executors.newSingleThreadExecutor();
        
        final String finalCommand = resolvedCommand;
        Future<TaskExecutionResult> future = executor.submit(() -> runCommand(finalCommand));
        
        try {
            TaskExecutionResult result = future.get(timeout, TimeUnit.SECONDS);
            logger.info("命令执行完成，状态: {}, 退出码: {}", result.getStatus(), result.getExitCode());
            return result;
        } catch (TimeoutException e) {
            future.cancel(true);
            logger.warn("命令执行超时: {}秒", timeout);
            return TaskExecutionResult.builder()
                    .status(TaskStatus.TIMEOUT)
                    .output("")
                    .errorMessage("执行超时，已超过 " + timeout + " 秒")
                    .exitCode(-1)
                    .build();
        } catch (Exception e) {
            logger.error("命令执行异常", e);
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
                   lower.equals("powershell.exe") || lower.equals("powershell") ||
                   lower.equals("java") || lower.equals("javac") || lower.equals("jcmd") ||
                   lower.equals("jps") || lower.equals("jstat") || lower.equals("jmap");
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
                   lower.equals("/bin/bash") || lower.equals("/usr/bin/env") ||
                   lower.equals("java") || lower.equals("javac") || lower.equals("jcmd") ||
                   lower.equals("jps") || lower.equals("jstat") || lower.equals("jmap");
        }
    }
    
    private TaskExecutionResult runCommand(String command) {
        Process process = null;
        try {
            String os = System.getProperty("os.name").toLowerCase();
            boolean isWindows = os.contains("win");
            
            ProcessBuilder pb = new ProcessBuilder();
            pb.redirectErrorStream(true);
            
            String workingDir = System.getProperty("user.dir");
            File scriptFile = resolveScriptFile(command, workingDir, isWindows);
            if (scriptFile != null) {
                pb.directory(scriptFile.getParentFile());
                logger.info("设置工作目录: {}", scriptFile.getParentFile().getAbsolutePath());
            }
            
            if (isWindows) {
                String actualCommand = command;
                if (scriptFile != null && scriptFile.exists()) {
                    actualCommand = "\"" + scriptFile.getAbsolutePath() + "\"" + 
                            extractArguments(command, isWindows);
                }
                logger.info("Windows执行命令: {}", actualCommand);
                pb.command("cmd.exe", "/c", actualCommand);
            } else {
                pb.command("sh", "-c", command);
            }
            
            process = pb.start();
            
            Charset charset = getSystemCharset(isWindows);
            logger.debug("使用编码: {}", charset.name());
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), charset))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            logger.debug("进程退出码: {}", exitCode);
            
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
            logger.error("命令执行异常", e);
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("执行异常: " + e.getClass().getSimpleName() + " - " + e.getMessage())
                    .exitCode(-1)
                    .build();
        } finally {
            if (process != null) {
                process.destroyForcibly();
            }
        }
    }
    
    private File resolveScriptFile(String command, String workingDir, boolean isWindows) {
        if (command == null || command.trim().isEmpty()) {
            return null;
        }
        
        String[] parts = command.trim().split("\\s+");
        if (parts.length == 0) {
            return null;
        }
        
        String firstPart = parts[0];
        
        if (isWindows) {
            if (firstPart.equalsIgnoreCase("cmd.exe") || 
                firstPart.equalsIgnoreCase("cmd") ||
                firstPart.equalsIgnoreCase("powershell.exe") ||
                firstPart.equalsIgnoreCase("powershell")) {
                if (parts.length >= 3) {
                    return findScriptFile(parts[2], workingDir, isWindows);
                }
                return null;
            }
        } else {
            if (firstPart.equalsIgnoreCase("sh") || 
                firstPart.equalsIgnoreCase("bash") ||
                firstPart.equalsIgnoreCase("/bin/sh") ||
                firstPart.equalsIgnoreCase("/bin/bash")) {
                if (parts.length >= 2) {
                    return findScriptFile(parts[1], workingDir, isWindows);
                }
                return null;
            }
        }
        
        return findScriptFile(firstPart, workingDir, isWindows);
    }
    
    private File findScriptFile(String scriptPath, String workingDir, boolean isWindows) {
        if (scriptPath == null || scriptPath.isEmpty()) {
            return null;
        }
        
        scriptPath = scriptPath.replace("\"", "").replace("'", "");
        
        Path path = Paths.get(scriptPath);
        if (path.isAbsolute()) {
            File file = path.toFile();
            if (file.exists()) {
                return file;
            }
        }
        
        File relativeToWorkDir = new File(workingDir, scriptPath);
        if (relativeToWorkDir.exists()) {
            return relativeToWorkDir.getAbsoluteFile();
        }
        
        File relativeToScripts = new File(workingDir, "scripts/" + scriptPath);
        if (relativeToScripts.exists()) {
            return relativeToScripts.getAbsoluteFile();
        }
        
        String scriptName = new File(scriptPath).getName();
        File inScriptsDir = new File(workingDir, "scripts/" + scriptName);
        if (inScriptsDir.exists()) {
            return inScriptsDir.getAbsoluteFile();
        }
        
        return new File(scriptPath);
    }
    
    private String extractArguments(String command, boolean isWindows) {
        if (command == null || command.trim().isEmpty()) {
            return "";
        }
        
        String[] parts = command.trim().split("\\s+");
        if (parts.length <= 1) {
            return "";
        }
        
        StringBuilder args = new StringBuilder();
        for (int i = 1; i < parts.length; i++) {
            args.append(" ").append(parts[i]);
        }
        return args.toString();
    }
    
    private Charset getSystemCharset(boolean isWindows) {
        if (isWindows) {
            try {
                String codePage = System.getProperty("sun.jnu.encoding");
                if (codePage != null && !codePage.isEmpty()) {
                    logger.debug("系统编码: {}", codePage);
                    return Charset.forName(codePage);
                }
            } catch (Exception e) {
                logger.debug("获取系统编码失败，使用默认编码");
            }
            return Charset.defaultCharset();
        }
        return Charset.defaultCharset();
    }
}
