package pe.edu.utp.campusventa.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del estudiante es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(name = "estudiante_nombre", nullable = false, length = 100)
    private String estudianteNombre;

    @Size(max = 100, message = "La carrera/ciclo no puede superar los 100 caracteres")
    @Column(name = "carrera_ciclo", length = 100)
    private String carreraCiclo;

    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    @Column(nullable = false)
    private Integer calificacion;

    @NotBlank(message = "El comentario es obligatorio")
    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres")
    @Column(nullable = false, length = 500)
    private String comentario;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private boolean verificado = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emprendimiento_id", nullable = false)
    @JsonBackReference
    private Emprendimiento emprendimiento;
}
