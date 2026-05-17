package com.xunreader.storage;

import com.xunreader.config.StorageConfig;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component("localStorage")
public class LocalStorage implements StorageStrategy {

    private final StorageConfig storageConfig;

    public LocalStorage(StorageConfig storageConfig) {
        this.storageConfig = storageConfig;
    }

    @Override
    public String read(String path) {
        try {
            Path filePath = Paths.get(storageConfig.getLocal().getPath(), path);
            return Files.readString(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    @Override
    public void write(String path, String content) {
        try {
            Path filePath = Paths.get(storageConfig.getLocal().getPath(), path);
            Files.createDirectories(filePath.getParent());
            Files.writeString(filePath, content);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write file", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            Path filePath = Paths.get(storageConfig.getLocal().getPath(), path);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public String getType() {
        return "local";
    }
}