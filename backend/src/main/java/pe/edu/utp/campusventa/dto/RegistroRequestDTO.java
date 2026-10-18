package pe.edu.utp.campusventa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroRequestDTO {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Formato de correo no válido")
    @Pattern(regexp = "(?i)^[a-zA-Z0-9._%+-]+@utp\\.edu\\.pe$", message = "El correo debe pertenecer obligatoriamente al dominio institucional @utp.edu.pe")
    private String email;

    @NotBlank(message = "El código de estudiante es obligatorio")
    @Pattern(regexp = "(?i)^U[0-9]{8}$", message = "El código debe iniciar con 'U' seguido de 8 dígitos numéricos (ej: U20210045)")
    private String codigo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private String carrera;
    private String ciclo;
    private String telefono;
}
