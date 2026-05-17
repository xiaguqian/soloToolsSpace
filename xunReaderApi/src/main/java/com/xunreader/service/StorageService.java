package com.xunreader.service;

import com.xunreader.config.StorageConfig;
import com.xunreader.storage.StorageStrategy;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class StorageService {

    private final Map<String, StorageStrategy> storageStrategies;
    private final StorageConfig storageConfig;

    public StorageService(Map<String, StorageStrategy> storageStrategies, StorageConfig storageConfig) {
        this.storageStrategies = storageStrategies;
        this.storageConfig = storageConfig;
    }

    public String read(String path, String storageType) {
        StorageStrategy strategy = storageStrategies.get(storageType + "Storage");
        if (strategy == null) {
            strategy = storageStrategies.get(storageConfig.getType() + "Storage");
        }
        return strategy.read(path);
    }

    public void write(String path, String content, String storageType) {
        StorageStrategy strategy = storageStrategies.get(storageType + "Storage");
        if (strategy == null) {
            strategy = storageStrategies.get(storageConfig.getType() + "Storage");
        }
        strategy.write(path, content);
    }

    public void delete(String path, String storageType) {
        StorageStrategy strategy = storageStrategies.get(storageType + "Storage");
        if (strategy == null) {
            strategy = storageStrategies.get(storageConfig.getType() + "Storage");
        }
        strategy.delete(path);
    }
}