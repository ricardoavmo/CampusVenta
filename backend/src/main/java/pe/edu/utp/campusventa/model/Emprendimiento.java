package pe.edu.utp.campusventa.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "emprendimientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Emprendimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotNull(message = "La categoría es obligatoria")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Categoria categoria;

    @Column(nullable = false)
    private boolean disponible;

    @Column(length = 50)
    private String torre;

    @Column(length = 50)
    private String piso;

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    @Column(length = 500)
    private String descripcion;

    @NotNull(message = "El precio inicial es obligatorio")
    @PositiveOrZero(message = "El precio debe ser mayor o igual a 0")
    @Column(name = "precio_desde", precision = 10, scale = 2)
    private BigDecimal precioDesde;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "El número de WhatsApp debe tener entre 9 y 15 dígitos numéricos")
    @Column(length = 15)
    private String whatsapp;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "vendedor_nombre", length = 100)
    private String vendedorNombre;

    @Column(name = "carrera_ciclo", length = 100)
    private String carreraCiclo;

    @Column
    private Double calificacion;

    @Column(name = "total_resenas")
    private Integer totalResenas;

    @Column(name = "tiempo_entrega", length = 50)
    private String tiempoEntrega;

    @OneToMany(mappedBy = "emprendimiento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<Producto> productos = new ArrayList<>();

    @OneToMany(mappedBy = "emprendimiento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("fechaCreacion DESC")
    @JsonManagedReference
    @Builder.Default
    private List<Resena> resenas = new ArrayList<>();

    public void addProducto(Producto p) {
        productos.add(p);
        p.setEmprendimiento(this);
    }

    public void addResena(Resena r) {
        resenas.add(r);
        r.setEmprendimiento(this);
    }
}
