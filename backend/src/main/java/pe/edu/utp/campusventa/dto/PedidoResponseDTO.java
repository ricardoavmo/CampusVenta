package pe.edu.utp.campusventa.dto;

import lombok.*;
import pe.edu.utp.campusventa.model.EstadoPedido;
import pe.edu.utp.campusventa.model.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoResponseDTO {
    private Long id;
    private String codigoPedido;
    private Long compradorId;
    private String compradorNombre;
    private String compradorTelefono;
    private Long emprendimientoId;
    private String tiendaNombre;
    private String tiendaAvatar;
    private String vendedorWhatsapp;
    private String torre;
    private String piso;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private String puntoEntrega;
    private EstadoPedido estado;
    private String notas;
    private LocalDateTime fechaCreacion;

    public static PedidoResponseDTO fromEntity(Pedido p) {
        return PedidoResponseDTO.builder()
                .id(p.getId())
                .codigoPedido(p.getCodigoPedido())
                .compradorId(p.getComprador() != null ? p.getComprador().getId() : null)
                .compradorNombre(p.getCompradorNombre())
                .compradorTelefono(p.getCompradorTelefono())
                .emprendimientoId(p.getEmprendimiento() != null ? p.getEmprendimiento().getId() : null)
                .tiendaNombre(p.getEmprendimiento() != null ? p.getEmprendimiento().getNombre() : null)
                .tiendaAvatar(p.getEmprendimiento() != null ? p.getEmprendimiento().getAvatarUrl() : null)
                .vendedorWhatsapp(p.getEmprendimiento() != null ? p.getEmprendimiento().getWhatsapp() : null)
                .torre(p.getEmprendimiento() != null ? p.getEmprendimiento().getTorre() : null)
                .piso(p.getEmprendimiento() != null ? p.getEmprendimiento().getPiso() : null)
                .productoNombre(p.getProductoNombre())
                .cantidad(p.getCantidad())
                .precioUnitario(p.getPrecioUnitario())
                .total(p.getTotal())
                .puntoEntrega(p.getPuntoEntrega())
                .estado(p.getEstado())
                .notas(p.getNotas())
                .fechaCreacion(p.getFechaCreacion())
                .build();
    }
}
