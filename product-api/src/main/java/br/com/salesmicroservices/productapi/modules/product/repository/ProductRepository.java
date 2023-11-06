package br.com.salesmicroservices.productapi.modules.product.repository;

import br.com.salesmicroservices.productapi.modules.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}
