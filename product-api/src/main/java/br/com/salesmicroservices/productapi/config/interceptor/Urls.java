package br.com.salesmicroservices.productapi.config.interceptor;

import java.util.List;

public class Urls {
    public static final List<String> PROTECTED_URLS = List.of(
            "api/products",
            "api/suppliers",
            "api/categories"
    );
}
