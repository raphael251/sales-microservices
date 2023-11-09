package br.com.salesmicroservices.productapi.modules.sales.dto;

import br.com.salesmicroservices.productapi.modules.sales.enums.SalesStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesConfirmationDTO {
    private String salesId;
    private SalesStatus salesStatus;
}
