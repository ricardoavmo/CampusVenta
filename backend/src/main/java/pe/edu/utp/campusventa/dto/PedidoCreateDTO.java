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

    private Long productoId;

    @Size(max = 150, message = "El nombre del producto no debe exceder 150 caracteres")
    private String productoNombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;

    // Ignorado en servidor: el precio se toma obligatoriamente de la base de datos
    private BigDecimal precioUnitario;

    private String puntoEntrega;
    private String notas;
    private String compradorTelefono;
}
