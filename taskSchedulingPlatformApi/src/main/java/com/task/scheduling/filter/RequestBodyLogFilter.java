package com.task.scheduling.filter;

import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestBodyLogFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RequestBodyLogFilter.class);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                     FilterChain filterChain) throws IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String contentType = request.getContentType();
        
        boolean shouldLogBody = contentType != null && 
                (contentType.contains("application/json") || 
                 contentType.contains("application/x-www-form-urlencoded")) &&
                ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method));
        
        if (shouldLogBody) {
            CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request);
            byte[] body = cachedRequest.getCachedBody();
            if (body.length > 0) {
                String bodyStr = new String(body, StandardCharsets.UTF_8);
                if (bodyStr.length() > 2000) {
                    bodyStr = bodyStr.substring(0, 2000) + " ... (truncated)";
                }
                logger.info("[REQUEST BODY] {} {}\n{}", method, uri, formatJson(bodyStr));
            }
            try {
                filterChain.doFilter(cachedRequest, response);
            } catch (Exception e) {
                logger.error("Filter exception: ", e);
                throw new IOException(e);
            }
        } else {
            try {
                filterChain.doFilter(request, response);
            } catch (Exception e) {
                logger.error("Filter exception: ", e);
                throw new IOException(e);
            }
        }
    }
    
    private String formatJson(String jsonStr) {
        try {
            Object json = JSON.parse(jsonStr);
            return JSON.toJSONString(json, true);
        } catch (Exception e) {
            return jsonStr;
        }
    }
    
    private static class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {
        
        private final byte[] cachedBody;
        
        public CachedBodyHttpServletRequest(HttpServletRequest request) throws IOException {
            super(request);
            this.cachedBody = StreamUtils.copyToByteArray(request.getInputStream());
        }
        
        public byte[] getCachedBody() {
            return this.cachedBody;
        }
        
        @Override
        public ServletInputStream getInputStream() {
            return new CachedBodyServletInputStream(this.cachedBody);
        }
    }
    
    private static class CachedBodyServletInputStream extends ServletInputStream {
        
        private final ByteArrayInputStream delegate;
        
        public CachedBodyServletInputStream(byte[] cachedBody) {
            this.delegate = new ByteArrayInputStream(cachedBody);
        }
        
        @Override
        public boolean isFinished() {
            return delegate.available() == 0;
        }
        
        @Override
        public boolean isReady() {
            return true;
        }
        
        @Override
        public void setReadListener(ReadListener readListener) {
        }
        
        @Override
        public int read() {
            return delegate.read();
        }
    }
}
