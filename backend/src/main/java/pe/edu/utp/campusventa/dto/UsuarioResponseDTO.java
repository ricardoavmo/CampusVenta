package pe.edu.utp.campusventa.dto;

import lombok.*;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String codigo;
    private Rol rol;
    private String carrera;
    private String ciclo;
    private String telefono;
    private String avatarUrl;
    private String bio;
    private String redesSocialesJson;
    private Long emprendimientoId;
    private String tiendaNombre;

    public static UsuarioResponseDTO fromEntity(Usuario u) {
        if (u == null) return null;
        Long empId = null;
        String storeName = null;
        if (u.getEmprendimientos() != null && !u.getEmprendimientos().isEmpty()) {
            empId = u.getEmprendimientos().get(0).getId();
            storeName = u.getEmprendimientos().get(0).getNombre();
        }
        return UsuarioResponseDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .codigo(u.getCodigo())
                .rol(u.getRol())
                .carrera(u.getCarrera())
                .ciclo(u.getCiclo())
                .telefono(u.getTelefono())
                .avatarUrl(u.getAvatarUrl())
                .bio(u.getBio())
                .redesSocialesJson(u.getRedesSocialesJson())
                .emprendimientoId(empId)
                .tiendaNombre(storeName)
                .build();
    }
}
