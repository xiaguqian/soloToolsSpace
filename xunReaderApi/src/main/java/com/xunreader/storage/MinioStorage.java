package com.xunreader.storage;

import com.xunreader.config.StorageConfig;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component("minioStorage")
public class MinioStorage implements StorageStrategy {

    private final MinioClient minioClient;
    private final StorageConfig storageConfig;

    public MinioStorage(StorageConfig storageConfig) {
        this.storageConfig = storageConfig;
        this.minioClient = MinioClient.builder()
                .endpoint(storageConfig.getMinio().getEndpoint())
                .credentials(storageConfig.getMinio().getAccessKey(), storageConfig.getMinio().getSecretKey())
                .build();
    }

    @Override
    public String read(String path) {
        try {
            InputStream stream = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(storageConfig.getMinio().getBucket())
                    .object(path)
                    .build());
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read from Minio", e);
        }
    }

    @Override
    public void write(String path, String content) {
        try {
            byte[] data = content.getBytes(StandardCharsets.UTF_8);
            InputStream stream = new java.io.ByteArrayInputStream(data);
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(storageConfig.getMinio().getBucket())
                    .object(path)
                    .stream(stream, data.length, -1)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to write to Minio", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(storageConfig.getMinio().getBucket())
                    .object(path)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete from Minio", e);
        }
    }

    @Override
    public String getType() {
        return "minio";
    }
}