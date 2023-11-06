package br.com.salesmicroservices.productapi.modules.category.controller;

import br.com.salesmicroservices.productapi.modules.category.dto.CategoryRequest;
import br.com.salesmicroservices.productapi.modules.category.dto.CategoryResponse;
import br.com.salesmicroservices.productapi.modules.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

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
}
