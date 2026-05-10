package com.task.scheduling.interceptor;

import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class RequestLogInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(RequestLogInterceptor.class);
    
    private static final String START_TIME_ATTR = "requestStartTime";
    private static final String REQUEST_BODY_ATTR = "requestBody";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute(START_TIME_ATTR, startTime);
        
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIp(request);
        
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!headerName.equalsIgnoreCase("authorization") && 
                !headerName.equalsIgnoreCase("cookie") &&
                !headerName.equalsIgnoreCase("set-cookie")) {
                headers.put(headerName, request.getHeader(headerName));
            }
        }
        
        Map<String, String[]> parameters = request.getParameterMap();
        
        StringBuilder logMsg = new StringBuilder();
        logMsg.append("\n");
        logMsg.append("========================================\n");
        logMsg.append("[HTTP REQUEST] ").append(method).append(" ").append(uri);
        if (queryString != null && !queryString.isEmpty()) {
            logMsg.append("?").append(queryString);
        }
        logMsg.append("\n");
        logMsg.append("Client IP: ").append(clientIp).append("\n");
        logMsg.append("Headers: ").append(JSON.toJSONString(headers)).append("\n");
        if (!parameters.isEmpty()) {
            logMsg.append("Parameters: ").append(JSON.toJSONString(parameters)).append("\n");
        }
        logMsg.append("========================================");
        
        logger.info(logMsg.toString());
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                 Object handler, Exception ex) {
        long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        long duration = System.currentTimeMillis() - startTime;
        int status = response.getStatus();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        StringBuilder logMsg = new StringBuilder();
        logMsg.append("\n");
        logMsg.append("========================================\n");
        logMsg.append("[HTTP RESPONSE] ").append(method).append(" ").append(uri).append("\n");
        logMsg.append("Status: ").append(status).append("\n");
        logMsg.append("Duration: ").append(duration).append("ms\n");
        if (ex != null) {
            logMsg.append("Exception: ").append(ex.getMessage()).append("\n");
        }
        logMsg.append("========================================");
        
        if (status >= 400 || ex != null) {
            logger.error(logMsg.toString());
        } else {
            logger.info(logMsg.toString());
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
