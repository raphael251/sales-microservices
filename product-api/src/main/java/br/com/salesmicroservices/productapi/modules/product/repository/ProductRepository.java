package br.com.salesmicroservices.productapi.modules.product.repository;

import br.com.salesmicroservices.productapi.modules.product.model.Product;
import br.com.salesmicroservices.productapi.modules.supplier.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByNameIgnoreCaseContaining(String name);

    List<Product> findByCategoryId(Integer categoryId);

    List<Product> findBySupplierId(Integer supplierId);

    Boolean existsByCategoryId(Integer categoryId);

    Boolean existsBySupplierId(Integer supplierId);
}
