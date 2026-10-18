package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioUpdateRequestDTO {
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;
    private String carrera;
    private String ciclo;
    private String telefono;
    private String avatarUrl;
    @Size(max = 500, message = "La biografía no puede superar los 500 caracteres")
    private String bio;
    private String redesSocialesJson;
}
