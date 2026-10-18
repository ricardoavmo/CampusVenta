package pe.edu.utp.campusventa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.utp.campusventa.model.Emprendimiento;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmprendimientoAdminDTO {
    private Long id;
    private String nombre;
    private String categoria;
    private String torre;
    private String piso;
    private boolean disponible;
    private boolean activo;
    private String whatsapp;
    private Double calificacion;
    private int totalResenas;
    private int totalProductos;
    private String avatarUrl;
    private Long propietarioId;
    private String propietarioNombre;
    private String propietarioEmail;
    private String propietarioCodigo;

    public static EmprendimientoAdminDTO fromEntity(Emprendimiento e) {
        return EmprendimientoAdminDTO.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .categoria(e.getCategoria() != null ? e.getCategoria().name() : null)
                .torre(e.getTorre())
                .piso(e.getPiso())
                .disponible(e.isDisponible())
                .activo(e.isActivo())
                .whatsapp(e.getWhatsapp())
                .calificacion(e.getCalificacion())
                .totalResenas(e.getTotalResenas() != null ? e.getTotalResenas() : 0)
                .totalProductos(e.getProductos() != null ? e.getProductos().size() : 0)
                .avatarUrl(e.getAvatarUrl())
                .propietarioId(e.getPropietario() != null ? e.getPropietario().getId() : null)
                .propietarioNombre(e.getPropietario() != null ? e.getPropietario().getNombre() : e.getVendedorNombre())
                .propietarioEmail(e.getPropietario() != null ? e.getPropietario().getEmail() : null)
                .propietarioCodigo(e.getPropietario() != null ? e.getPropietario().getCodigo() : null)
                .build();
    }
}
