package br.com.salesmicroservices.productapi.modules.product.controller;

import br.com.salesmicroservices.productapi.config.SuccessResponse;
import br.com.salesmicroservices.productapi.modules.product.dto.ProductRequest;
import br.com.salesmicroservices.productapi.modules.product.dto.ProductResponse;
import br.com.salesmicroservices.productapi.modules.product.service.ProductService;
import br.com.salesmicroservices.productapi.modules.supplier.dto.SupplierResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
public class ProductController {
    @Autowired
    private ProductService productService;

    @PostMapping
    public ProductResponse save(@RequestBody ProductRequest request) {
        return productService.save(request);
    }

    @GetMapping
    public List<ProductResponse> findAll() {
        return productService.findAll();
    }

    @GetMapping("{id}")
    public ProductResponse findById(@PathVariable Integer id) {
        return productService.findByIdResponse(id);
    }

    @GetMapping("name/{name}")
    public List<ProductResponse> findById(@PathVariable String name) {
        return productService.findByName((name));
    }

    @GetMapping("suppliers/{supplierId}")
    public List<ProductResponse> findBySupplierId(@PathVariable Integer supplierId) {
        return productService.findBySupplierId((supplierId));
    }

    @GetMapping("categories/{categoryId}")
    public List<ProductResponse> findByCategoryId(@PathVariable Integer categoryId) {
        return productService.findByCategoryId((categoryId));
    }

    @PutMapping("{id}")
    public ProductResponse update(@RequestBody ProductRequest request, @PathVariable Integer id) {
        return productService.update(request, id);
    }

    @DeleteMapping("{id}")
    public SuccessResponse delete(@PathVariable Integer id) {
        return productService.delete(id);
    }
}
