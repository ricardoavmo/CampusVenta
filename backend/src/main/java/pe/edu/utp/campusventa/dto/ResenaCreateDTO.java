package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResenaCreateDTO {

    @NotBlank(message = "Tu nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String estudianteNombre;

    @Size(max = 100, message = "La carrera/ciclo no puede superar los 100 caracteres")
    private String carreraCiclo;

    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;

    @NotBlank(message = "El comentario sobre tu experiencia es obligatorio")
    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres")
    private String comentario;
}
