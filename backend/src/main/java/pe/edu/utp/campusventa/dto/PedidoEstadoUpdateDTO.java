package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import pe.edu.utp.campusventa.model.EstadoPedido;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEstadoUpdateDTO {
    @NotNull(message = "El nuevo estado del pedido es obligatorio")
    private EstadoPedido estado;
}
