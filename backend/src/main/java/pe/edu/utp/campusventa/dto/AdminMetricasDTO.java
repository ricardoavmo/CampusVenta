package pe.edu.utp.campusventa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricasDTO {
    private long totalUsuarios;
    private long totalCompradores;
    private long totalVendedores;
    private long totalAdmins;

    private long totalEmprendimientos;
    private long totalEmprendimientosActivos;
    private long totalProductos;
    private long totalResenas;
    private Double promedioCalificacionCampus;

    private Map<String, Long> distribucionZonas;
    private Map<String, Long> distribucionCategorias;
}
