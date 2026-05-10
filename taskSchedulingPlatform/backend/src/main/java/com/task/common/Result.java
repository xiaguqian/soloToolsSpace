package com.task.common;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Result<T> {
    private String timestamp;
    private int status;
    private String message;
    private T data;

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setTimestamp(LocalDateTime.now().toString());
        result.setStatus(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setTimestamp(LocalDateTime.now().toString());
        result.setStatus(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(int status, String message) {
        Result<T> result = new Result<>();
        result.setTimestamp(LocalDateTime.now().toString());
        result.setStatus(status);
        result.setMessage(message);
        result.setData(null);
        return result;
    }
}
