package br.com.salesmicroservices.productapi.config.interceptor;

import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import br.com.salesmicroservices.productapi.modules.jwt.dto.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

import static org.springframework.util.ObjectUtils.isEmpty;

public class AuthInterceptor implements HandlerInterceptor {
    private static final String AUTHORIZATION = "Authorization";
    private static final String TRANSACTION_ID = "transactionid";

    @Autowired
    private JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (isOptions(request)) {
            return true;
        }

        if (isEmpty(request.getHeader(TRANSACTION_ID))) {
            throw new ValidationException("the transactionid header is required.");
        }

        var authorization = request.getHeader(AUTHORIZATION);

        jwtService.validateAuthentication(authorization);

        request.setAttribute("serviceid", UUID.randomUUID().toString());

        return true;
    }

    private Boolean isOptions(HttpServletRequest request) {
        return HttpMethod.OPTIONS.name().equals(request.getMethod());
    }
}
