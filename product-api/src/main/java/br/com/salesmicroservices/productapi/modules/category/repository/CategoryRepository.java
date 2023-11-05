package br.com.salesmicroservices.productapi.modules.category.repository;

import br.com.salesmicroservices.productapi.modules.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
