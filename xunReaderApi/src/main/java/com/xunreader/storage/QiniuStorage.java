package com.xunreader.storage;

import com.qiniu.storage.BucketManager;
import com.qiniu.storage.Configuration;
import com.qiniu.storage.Region;
import com.qiniu.storage.UploadManager;
import com.qiniu.util.Auth;
import com.xunreader.config.StorageConfig;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;

@Component("qiniuStorage")
public class QiniuStorage implements StorageStrategy {

    private final StorageConfig storageConfig;
    private final UploadManager uploadManager;
    private final BucketManager bucketManager;
    private final Auth auth;

    public QiniuStorage(StorageConfig storageConfig) {
        this.storageConfig = storageConfig;
        Configuration cfg = new Configuration(Region.autoRegion());
        this.uploadManager = new UploadManager(cfg);
        this.auth = Auth.create(storageConfig.getQiniu().getAccessKey(), storageConfig.getQiniu().getSecretKey());
        this.bucketManager = new BucketManager(auth, cfg);
    }

    @Override
    public String read(String path) {
        String publicUrl = storageConfig.getQiniu().getDomain() + "/" + path;
        throw new UnsupportedOperationException("Qiniu storage read not implemented, use URL: " + publicUrl);
    }

    @Override
    public void write(String path, String content) {
        try {
            byte[] data = content.getBytes("UTF-8");
            ByteArrayInputStream byteInputStream = new ByteArrayInputStream(data);
            uploadManager.put(byteInputStream, path, auth.uploadToken(storageConfig.getQiniu().getBucket()), null, null);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload to Qiniu", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            bucketManager.delete(storageConfig.getQiniu().getBucket(), path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete from Qiniu", e);
        }
    }

    @Override
    public String getType() {
        return "qiniu";
    }
}