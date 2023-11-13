package br.com.salesmicroservices.productapi.modules.category.service;

import br.com.salesmicroservices.productapi.config.SuccessResponse;
import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryRequest;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryResponse;
import br.com.salesmicroservices.productapi.modules.category.model.Category;
import br.com.salesmicroservices.productapi.modules.category.repository.CategoryRepository;
import br.com.salesmicroservices.productapi.modules.product.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.util.ObjectUtils.isEmpty;

@Service
@AllArgsConstructor(onConstructor_ = { @Lazy })
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Lazy
    private final ProductService productService;

    public CategoryResponse findByIdResponse(Integer id) {
        return CategoryResponse.of(findById(id));
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository
                .findAll()
                .stream()
                .map(CategoryResponse::of)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> findByDescription(String description) {
        if (isEmpty(description)) {
            throw new ValidationException("The category description was not informed.");
        }
        return categoryRepository
                .findByDescriptionIgnoreCaseContaining(description)
                .stream()
                .map(CategoryResponse::of)
                .collect(Collectors.toList());
    }

    public Category findById(Integer id) {
        validateInformedId(id);
        return categoryRepository.findById(id).orElseThrow(() -> new ValidationException("There is no category for the given ID."));
    }

    public CategoryResponse save(CategoryRequest request) {
        validateCategoryNameInformed(request);
        var category = categoryRepository.save(Category.of(request));
        return CategoryResponse.of(category);
    }

    public CategoryResponse update(CategoryRequest request, Integer id) {
        validateCategoryNameInformed(request);
        validateInformedId(id);
        var category = Category.of(request);
        category.setId(id);
        categoryRepository.save(category);
        return CategoryResponse.of(category);
    }

    private void validateCategoryNameInformed(CategoryRequest request) {
        if (isEmpty(request.getDescription())) {
            throw new ValidationException("The category description was not informed.");
        }
    }

    public SuccessResponse delete(Integer id) {
        validateInformedId(id);
        if (productService.existsByCategoryId(id)) {
            throw new ValidationException("You cannot delete this category since it is associated with an existing product.");
        }
        categoryRepository.deleteById(id);
        return SuccessResponse.create("The category was deleted successfully");
    }

    private void validateInformedId(Integer id) {
        if (isEmpty(id)) {
            throw new ValidationException("The category ID was not informed.");
        }
    }
}
