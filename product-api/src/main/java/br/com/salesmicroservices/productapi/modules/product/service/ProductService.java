package br.com.salesmicroservices.productapi.modules.product.service;

import br.com.salesmicroservices.productapi.config.SuccessResponse;
import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import br.com.salesmicroservices.productapi.modules.category.service.CategoryService;
import br.com.salesmicroservices.productapi.modules.product.dto.*;
import br.com.salesmicroservices.productapi.modules.product.model.Product;
import br.com.salesmicroservices.productapi.modules.product.repository.ProductRepository;
import br.com.salesmicroservices.productapi.modules.sales.client.SalesClient;
import br.com.salesmicroservices.productapi.modules.sales.dto.SalesConfirmationDTO;
import br.com.salesmicroservices.productapi.modules.sales.enums.SalesStatus;
import br.com.salesmicroservices.productapi.modules.sales.rabbitmq.SalesConfirmationSender;
import br.com.salesmicroservices.productapi.modules.supplier.service.SupplierService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.util.ObjectUtils.isEmpty;

@Slf4j
@Service
public class ProductService {
    private static final Integer ZERO = 0;

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private SupplierService supplierService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private SalesConfirmationSender salesConfirmationSender;

    @Autowired
    private SalesClient salesClient;

    public ProductResponse findByIdResponse(Integer id) {
        return ProductResponse.of(findById(id));
    }

    public List<ProductResponse> findAll() {
        return productRepository
                .findAll()
                .stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> findByName(String name) {
        if (isEmpty(name)) {
            throw new ValidationException("The product name was not informed.");
        }
        return productRepository
                .findByNameIgnoreCaseContaining(name)
                .stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> findBySupplierId(Integer supplierId) {
        if (isEmpty(supplierId)) {
            throw new ValidationException("The product supplier ID was not informed.");
        }
        return productRepository
                .findBySupplierId(supplierId)
                .stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> findByCategoryId(Integer categoryId) {
        if (isEmpty(categoryId)) {
            throw new ValidationException("The product category ID was not informed.");
        }
        return productRepository
                .findBySupplierId(categoryId)
                .stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    public Product findById(Integer id) {
        validateInformedId(id);
        return productRepository.findById(id).orElseThrow(() -> new ValidationException("There is no product for the given ID."));
    }

    public ProductResponse save(ProductRequest request) {
        validateProductDataInformed(request);
        validateCategoryAndSupplierIdInformed(request);
        var category = categoryService.findById(request.getCategoryId());
        var supplier = supplierService.findById((request.getSupplierId()));
        var product = productRepository.save(Product.of(request, category, supplier));
        return ProductResponse.of(product);
    }

    public ProductResponse update(ProductRequest request, Integer id) {
        validateProductDataInformed(request);
        validateInformedId(id);
        validateCategoryAndSupplierIdInformed(request);
        var category = categoryService.findById(request.getCategoryId());
        var supplier = supplierService.findById((request.getSupplierId()));
        var product = Product.of(request, category, supplier);
        product.setId(id);
        productRepository.save(product);
        return ProductResponse.of(product);
    }

    private void validateProductDataInformed(ProductRequest request) {
        if (isEmpty(request.getName())) {
            throw new ValidationException("The product name was not informed.");
        }
        if (isEmpty(request.getQuantityAvailable())) {
            throw new ValidationException(("The product quantity was not informed"));
        }
        if (request.getQuantityAvailable() < ZERO) {
            throw new ValidationException("The product quantity should not be less than or equal to zero.");
        }
    }

    private void validateCategoryAndSupplierIdInformed(ProductRequest request) {
        if (isEmpty(request.getCategoryId())) {
            throw new ValidationException("The category ID was not informed.");
        }
        if (isEmpty(request.getSupplierId())) {
            throw new ValidationException("The supplier ID was not informed.");
        }
    }

    public Boolean existsByCategoryId(Integer categoryId) {
        return productRepository.existsByCategoryId(categoryId);
    }

    public Boolean existsBySupplierId(Integer supplierId) {
        return productRepository.existsBySupplierId(supplierId);
    }

    public SuccessResponse delete(Integer id) {
        validateInformedId(id);
        productRepository.deleteById(id);
        return SuccessResponse.create("The product was deleted successfully");
    }

    private void validateInformedId(Integer id) {
        if (isEmpty(id)) {
            throw new ValidationException("The product ID was not informed.");
        }
    }

    public void updateProductStock(ProductStockDTO productStock) {
        try {
            validateStockUpdateData(productStock);
            updateStock(productStock);
        } catch (Exception ex) {
            log.error("Error while trying to update stock for message with error: {}", ex.getMessage(), ex);
            var rejectedSalesMessage = new SalesConfirmationDTO(productStock.getSalesId(), SalesStatus.REJECTED);
            salesConfirmationSender.sendSalesConfirmationMessage(rejectedSalesMessage);
        }
    }

    private void validateStockUpdateData(ProductStockDTO productStock) {
        if (isEmpty(productStock) || isEmpty(productStock.getSalesId())) {
            throw new ValidationException("The product data and salesId must be informed.");
        }
        if (isEmpty(productStock.getProducts())) {
            throw new ValidationException("The product items must be informed.");
        }
        productStock
                .getProducts()
                .forEach(salesProduct -> {
                    if (isEmpty(salesProduct.getQuantity()) || isEmpty(salesProduct.getQuantity())) {
                        throw new ValidationException("The productId and the quantity must be informed.");
                    }
                });
    }

    @Transactional
    private void updateStock(ProductStockDTO productStock) {
        var productsForUpdate = new ArrayList<Product>();
        productStock.getProducts().forEach(salesProduct -> {
            var existingProduct = findById(salesProduct.getProductId());
            validateQuantityInStock(salesProduct, existingProduct);
            existingProduct.updateStock(salesProduct.getQuantity());
            productsForUpdate.add(existingProduct);
        });

        productRepository.saveAll(productsForUpdate);
        var approvedSalesMessage = new SalesConfirmationDTO(productStock.getSalesId(), SalesStatus.APPROVED);
        salesConfirmationSender.sendSalesConfirmationMessage(approvedSalesMessage);
    }

    private void validateQuantityInStock(ProductQuantityDTO salesProduct, Product existingProduct) {
        if (salesProduct.getQuantity() > existingProduct.getQuantityAvailable()) {
            throw new ValidationException(
                    String.format("The product %s is out of stock.", existingProduct.getId())
            );
        }
    }

    public ProductSalesResponse findProductSales(Integer id) {
        var product = findById(id);
        try {
            var sales = salesClient
                    .findSalesByProductId(product.getId())
                    .orElseThrow(() -> new ValidationException("The was not found any sales for this product."));
            return ProductSalesResponse.of(product, sales.getSalesIds());
        } catch (Exception ex) {
            throw new ValidationException("There was an error trying to get the product sales");
        }
    }

    public SuccessResponse checkProductsStock(ProductCheckStockRequest request) {
        if (isEmpty(request)) {
            throw new ValidationException("The request data must be informed.");
        }
        request
                .getProducts()
                .forEach(this::validateStock);
        return SuccessResponse.create("The stock is ok.");
    }

    private void validateStock(ProductQuantityDTO productQuantity) {
        if (isEmpty(productQuantity.getProductId()) || isEmpty(productQuantity.getQuantity())) {
            throw new ValidationException("ProductId and quantity must be informed.");
        }
        var product = findById(productQuantity.getProductId());
        if (productQuantity.getQuantity() > product.getQuantityAvailable()) {
            throw new ValidationException(String.format("The product %s is out of stock", product.getId()));
        }
    }
}
