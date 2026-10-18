package pe.edu.utp.campusventa.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    @Builder.Default
    private String tipoToken = "Bearer";
    private UsuarioResponseDTO usuario;
}
