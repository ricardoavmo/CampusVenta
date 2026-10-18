package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoCreateDTO {

    @NotNull(message = "El ID del emprendimiento es obligatorio")
    private Long emprendimientoId;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 150, message = "El nombre del producto no debe exceder 150 caracteres")
    private String productoNombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor a 0")
    private BigDecimal precioUnitario;

    private String puntoEntrega;
    private String notas;
    private String compradorTelefono;
}
