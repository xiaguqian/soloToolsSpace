package com.xunfood;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.xunfood.mapper")
public class XunFoodApplication {
    public static void main(String[] args) {
        SpringApplication.run(XunFoodApplication.class, args);
    }
}
