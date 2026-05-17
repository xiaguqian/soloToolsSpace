package com.xunreader;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.xunreader.mapper")
public class XunReaderApplication {

    public static void main(String[] args) {
        SpringApplication.run(XunReaderApplication.class, args);
    }
}