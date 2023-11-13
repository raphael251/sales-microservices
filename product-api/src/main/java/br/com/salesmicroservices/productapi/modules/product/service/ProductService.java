package br.com.salesmicroservices.productapi.modules.product.service;

import br.com.salesmicroservices.productapi.config.SuccessResponse;
import br.com.salesmicroservices.productapi.config.exception.ValidationException;
import br.com.salesmicroservices.productapi.modules.category.service.CategoryService;
import br.com.salesmicroservices.productapi.modules.product.dto.*;
import br.com.salesmicroservices.productapi.modules.product.model.Product;
import br.com.salesmicroservices.productapi.modules.product.repository.ProductRepository;
import br.com.salesmicroservices.productapi.modules.sales.client.SalesClient;
import br.com.salesmicroservices.productapi.modules.sales.dto.SalesConfirmationDTO;
import br.com.salesmicroservices.productapi.modules.sales.dto.SalesProductResponse;
import br.com.salesmicroservices.productapi.modules.sales.enums.SalesStatus;
import br.com.salesmicroservices.productapi.modules.sales.rabbitmq.SalesConfirmationSender;
import br.com.salesmicroservices.productapi.modules.supplier.service.SupplierService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static br.com.salesmicroservices.productapi.config.RequestUtil.getCurrentRequest;
import static org.springframework.util.ObjectUtils.isEmpty;

@Slf4j
@Service
@AllArgsConstructor
public class ProductService {
    private static final Integer ZERO = 0;
    private static final String AUTHORIZATION = "Authorization";
    private static final String TRANSACTION_ID = "transactionid";
    private static final String SERVICE_ID = "serviceid";
    private final ObjectMapper objectMapper;

    private final ProductRepository productRepository;
    private final SupplierService supplierService;
    private final CategoryService categoryService;
    private final SalesConfirmationSender salesConfirmationSender;
    private final SalesClient salesClient;

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
        if (!productRepository.existsById(id)) {
            throw new ValidationException("The product does not exists.");
        }
        var sales = getSalesByProductId(id);

        if (!isEmpty(sales.getSalesIds())) {
            throw new ValidationException("The product cannot be deleted. There are sales for it.");
        }

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
            var rejectedSalesMessage = new SalesConfirmationDTO(productStock.getSalesId(), SalesStatus.REJECTED, productStock.getTransactionid());
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
        var approvedSalesMessage = new SalesConfirmationDTO(productStock.getSalesId(), SalesStatus.APPROVED, productStock.getTransactionid());
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
        var sales = getSalesByProductId(id);
        return ProductSalesResponse.of(product, sales.getSalesIds());
    }

    private SalesProductResponse getSalesByProductId(Integer productId) {
        try {
            var currentRequest = getCurrentRequest();
            var token = currentRequest.getHeader(AUTHORIZATION);
            var transactionid = currentRequest.getHeader(TRANSACTION_ID);
            var serviceid = currentRequest.getAttribute(SERVICE_ID);
            log.info("Sending GET request to orders by productId with data {} | [transactionID: {} | serviceID: {}]",
                    productId, transactionid, serviceid);


            var response = salesClient
                    .findSalesByProductId(productId, token, transactionid)
                    .orElseThrow(() -> new ValidationException("The was not found any sales for this product."));

            log.info("Receiving response from orders by productId with data {} | [transactionID: {} | serviceID: {}]",
                    objectMapper.writeValueAsString(response), transactionid, serviceid);

            return response;
        } catch (Exception ex) {
            log.error("Error while trying to get the product sales with error: {}", ex.getMessage(), ex);
            throw new ValidationException("There was an error trying to get the product sales");
        }
    }

    public SuccessResponse checkProductsStock(ProductCheckStockRequest request) {
        try {
            var currentRequest = getCurrentRequest();
            var transactionid = currentRequest.getHeader(TRANSACTION_ID);
            var serviceid = currentRequest.getAttribute(SERVICE_ID);
            log.info("Request to POST product stock with data {} | [transactionID: {} | serviceID: {}]",
                    objectMapper.writeValueAsString(request), transactionid, serviceid);
            if (isEmpty(request)) {
                throw new ValidationException("The request data must be informed.");
            }
            request
                    .getProducts()
                    .forEach(this::validateStock);
            var response = SuccessResponse.create("The stock is ok.");

            log.info("Response to POST product stock with data {} | [transactionID: {} | serviceID: {}]",
                    objectMapper.writeValueAsString(response), transactionid, serviceid);

            return response;
        } catch (Exception ex) {
            throw new ValidationException(ex.getMessage());
        }
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
