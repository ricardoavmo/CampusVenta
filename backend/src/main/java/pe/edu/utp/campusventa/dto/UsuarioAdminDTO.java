package pe.edu.utp.campusventa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminDTO {
    private Long id;
    private String nombre;
    private String email;
    private String codigo;
    private Rol rol;
    private String carrera;
    private String ciclo;
    private String telefono;
    private String avatarUrl;
    private boolean activo;
    private int totalEmprendimientos;
    private LocalDateTime fechaCreacion;

    public static UsuarioAdminDTO fromEntity(Usuario u) {
        return UsuarioAdminDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .codigo(u.getCodigo())
                .rol(u.getRol())
                .carrera(u.getCarrera())
                .ciclo(u.getCiclo())
                .telefono(u.getTelefono())
                .avatarUrl(u.getAvatarUrl())
                .activo(u.isActivo())
                .totalEmprendimientos(u.getEmprendimientos() != null ? u.getEmprendimientos().size() : 0)
                .fechaCreacion(u.getFechaCreacion())
                .build();
    }
}
