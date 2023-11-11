package br.com.salesmicroservices.productapi.config;

import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Slf4j
public class RequestUtil {
    public static HttpServletRequest getCurrentRequest() {
        try {
            return ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder
                    .getRequestAttributes()))
                    .getRequest();
        } catch (Exception ex) {
            log.error("Error getting the current request: {} \n\n stack trace {}", ex.getMessage(), ex.getStackTrace());
            throw new ValidationException("The current request could not be processed.");
        }
    }
}
