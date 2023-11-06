package br.com.salesmicroservices.productapi.modules.supplier.controller;

import br.com.salesmicroservices.productapi.modules.supplier.service.SupplierService;
import br.com.salesmicroservices.productapi.modules.supplier.dto.SupplierRequest;
import br.com.salesmicroservices.productapi.modules.supplier.dto.SupplierResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController {
    @Autowired
    private SupplierService supplierService;

    @PostMapping
    public SupplierResponse save(@RequestBody SupplierRequest request) {
        return supplierService.save(request);
    }
}
