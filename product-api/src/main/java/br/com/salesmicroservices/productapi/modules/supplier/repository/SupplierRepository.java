package br.com.salesmicroservices.productapi.modules.supplier.repository;

import br.com.salesmicroservices.productapi.modules.category.model.Category;
import br.com.salesmicroservices.productapi.modules.supplier.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    List<Supplier> findByNameIgnoreCaseContaining(String name);
}
