package br.com.salesmicroservices.productapi.modules.category.service;

import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryRequest;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryResponse;
import br.com.salesmicroservices.productapi.modules.category.model.Category;
import br.com.salesmicroservices.productapi.modules.category.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static org.springframework.util.ObjectUtils.isEmpty;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryResponse save(CategoryRequest request) {
        validateCategoryNameInformed(request);
        var category = categoryRepository.save(Category.of(request));
        return CategoryResponse.of(category);
    }

    private void validateCategoryNameInformed(CategoryRequest request) {
        if (isEmpty(request.getDescription())) {
            throw new ValidationException("The category description was not informed.");
        }
    }
}
