package pe.edu.utp.campusventa.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_pedido", nullable = false, unique = true, length = 30)
    private String codigoPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id")
    @JsonBackReference(value = "usuario-pedidos")
    private Usuario comprador;

    @Column(name = "comprador_nombre", length = 100)
    private String compradorNombre;

    @Column(name = "comprador_telefono", length = 20)
    private String compradorTelefono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emprendimiento_id", nullable = false)
    @JsonBackReference(value = "emprendimiento-pedidos")
    private Emprendimiento emprendimiento;

    @Column(name = "producto_nombre", nullable = false, length = 150)
    private String productoNombre;

    @Column(nullable = false)
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "punto_entrega", length = 150)
    private String puntoEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(length = 500)
    private String notas;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Transient
    public Long getCompradorId() {
        return comprador != null ? comprador.getId() : null;
    }

    @Transient
    public Long getEmprendimientoId() {
        return emprendimiento != null ? emprendimiento.getId() : null;
    }

    @Transient
    public String getEmprendimientoNombre() {
        return emprendimiento != null ? emprendimiento.getNombre() : null;
    }

    @Transient
    public String getEmprendimientoAvatar() {
        return emprendimiento != null ? emprendimiento.getAvatarUrl() : null;
    }

    @Transient
    public String getVendedorWhatsapp() {
        return emprendimiento != null ? emprendimiento.getWhatsapp() : null;
    }
}
