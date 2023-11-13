package br.com.salesmicroservices.productapi.modules.category.controller;

import br.com.salesmicroservices.productapi.config.SuccessResponse;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryRequest;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryResponse;
import br.com.salesmicroservices.productapi.modules.category.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@AllArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    public CategoryResponse save(@RequestBody CategoryRequest request) {
        return categoryService.save(request);
    }

    @GetMapping
    public List<CategoryResponse> findAll() {
        return categoryService.findAll();
    }

    @GetMapping("{id}")
    public CategoryResponse findById(@PathVariable Integer id) {
        return categoryService.findByIdResponse(id);
    }

    @GetMapping("description/{description}")
    public List<CategoryResponse> findById(@PathVariable String description) {
        return categoryService.findByDescription((description));
    }

    @PutMapping("{id}")
    public CategoryResponse update(@RequestBody CategoryRequest request, @PathVariable Integer id) {
        return categoryService.update(request, id);
    }

    @DeleteMapping("{id}")
    public SuccessResponse delete(@PathVariable Integer id) {
        return categoryService.delete(id);
    }
}
