package br.com.salesmicroservices.productapi.modules.product.rabbitmq;

import br.com.salesmicroservices.productapi.modules.product.dto.ProductStockDTO;
import br.com.salesmicroservices.productapi.modules.product.service.ProductService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProductStockListener {
    @Autowired
    private ProductService productService;

    @RabbitListener(queues = "${app-config.rabbit.queue.product-stock}")
    public void receiveProductStockMessage(ProductStockDTO productStock) throws JsonProcessingException {
        log.info("Receiving message with data: {}",
                new ObjectMapper().writeValueAsString(productStock)
        );
        productService.updateProductStock(productStock);
    }
}
