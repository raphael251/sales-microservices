package br.com.salesmicroservices.productapi.modules.jwt.dto;

import br.com.salesmicroservices.productapi.config.exception.AuthenticationException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static org.springframework.util.ObjectUtils.isEmpty;

@Service
public class JwtService {
    private static final String EMPTY_SPACE = " ";
    private static final Integer TOKEN_INDEX = 1;

    @Value("${app-config.secrets.jwt-secret}")
    private String jwtSecret;

    public void validateAuthentication(String token) {
        var accessToken = extractToken(token);
        try {
            var claims = Jwts
                    .parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseSignedClaims(accessToken)
                    .getPayload();
            var user = JwtResponse.getUser(claims);

            if (isEmpty(user) || isEmpty(user.getId())) {
                throw new AuthenticationException("The user is not valid.");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new AuthenticationException("Error processing the access token");
        }
    }

    private String extractToken(String token) {
        if (isEmpty(token)) {
            throw new AuthenticationException("The access token was not informed.");
        }
        if (token.contains(EMPTY_SPACE)) {
            token = token.split(EMPTY_SPACE)[TOKEN_INDEX];
        }
        return token;
    }
}
