package com.xunreader.storage;

public interface StorageStrategy {
    String read(String path);
    void write(String path, String content);
    void delete(String path);
    String getType();
}