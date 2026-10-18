package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {

    @NotBlank(message = "El correo institucional o código de estudiante es obligatorio")
    private String identificador;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
