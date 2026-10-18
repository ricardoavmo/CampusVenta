package pe.edu.utp.campusventa.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.campusventa.dto.AdminMetricasDTO;
import pe.edu.utp.campusventa.dto.EmprendimientoAdminDTO;
import pe.edu.utp.campusventa.dto.UsuarioAdminDTO;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.UserPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final EmprendimientoRepository emprendimientoRepository;
    private final ProductoRepository productoRepository;
    private final ResenaRepository resenaRepository;

    public AdminController(
            UsuarioRepository usuarioRepository,
            EmprendimientoRepository emprendimientoRepository,
            ProductoRepository productoRepository,
            ResenaRepository resenaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.emprendimientoRepository = emprendimientoRepository;
        this.productoRepository = productoRepository;
        this.resenaRepository = resenaRepository;
    }

    @GetMapping("/metricas")
    public ResponseEntity<AdminMetricasDTO> getMetricas() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<Emprendimiento> emprendimientos = emprendimientoRepository.findAll();

        long totalCompradores = usuarios.stream().filter(u -> u.getRol() == Rol.COMPRADOR).count();
        long totalVendedores = usuarios.stream().filter(u -> u.getRol() == Rol.VENDEDOR).count();
        long totalAdmins = usuarios.stream().filter(u -> u.getRol() == Rol.ADMIN).count();

        long totalActivos = emprendimientos.stream().filter(Emprendimiento::isDisponible).count();
        long totalProductos = productoRepository.count();
        long totalResenas = resenaRepository.count();

        Double promedioCalificacion = emprendimientos.stream()
                .filter(e -> e.getCalificacion() != null && e.getTotalResenas() != null && e.getTotalResenas() > 0)
                .mapToDouble(Emprendimiento::getCalificacion)
                .average()
                .orElse(0.0);
        promedioCalificacion = Math.round(promedioCalificacion * 10.0) / 10.0;

        Map<String, Long> distribucionZonas = new HashMap<>();
        emprendimientos.forEach(e -> {
            String zona = e.getTorre() != null ? e.getTorre().trim() : "Sin Zona";
            distribucionZonas.put(zona, distribucionZonas.getOrDefault(zona, 0L) + 1);
        });

        Map<String, Long> distribucionCategorias = new HashMap<>();
        emprendimientos.forEach(e -> {
            String cat = e.getCategoria() != null ? e.getCategoria().name() : "OTRO";
            distribucionCategorias.put(cat, distribucionCategorias.getOrDefault(cat, 0L) + 1);
        });

        AdminMetricasDTO metricas = AdminMetricasDTO.builder()
                .totalUsuarios(usuarios.size())
                .totalCompradores(totalCompradores)
                .totalVendedores(totalVendedores)
                .totalAdmins(totalAdmins)
                .totalEmprendimientos(emprendimientos.size())
                .totalEmprendimientosActivos(totalActivos)
                .totalProductos(totalProductos)
                .totalResenas(totalResenas)
                .promedioCalificacionCampus(promedioCalificacion)
                .distribucionZonas(distribucionZonas)
                .distribucionCategorias(distribucionCategorias)
                .build();

        return ResponseEntity.ok(metricas);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioAdminDTO>> getUsuarios() {
        // El directorio de estudiantes solo lista la comunidad estudiantil (COMPRADOR y VENDEDOR)
        List<UsuarioAdminDTO> dtos = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() != Rol.ADMIN)
                .map(UsuarioAdminDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/usuarios/{id}/rol")
    public ResponseEntity<UsuarioAdminDTO> cambiarRolUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String nuevoRolStr = body.get("rol");
        if (nuevoRolStr == null || nuevoRolStr.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol es obligatorio.");
        }

        Rol nuevoRol;
        try {
            nuevoRol = Rol.valueOf(nuevoRolStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no válido: " + nuevoRolStr);
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (principal != null && principal.getId().equals(id) && nuevoRol != Rol.ADMIN) {
            long totalAdmins = usuarioRepository.findAll().stream().filter(u -> u.getRol() == Rol.ADMIN).count();
            if (totalAdmins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes quitarte el rol de ADMIN si eres el único administrador del sistema.");
            }
        }

        usuario.setRol(nuevoRol);
        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(UsuarioAdminDTO.fromEntity(guardado));
    }

    @PatchMapping("/usuarios/{id}/estado")
    public ResponseEntity<UsuarioAdminDTO> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Boolean activo = body.get("activo");
        if (activo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado 'activo' es obligatorio.");
        }

        if (principal != null && principal.getId().equals(id) && !activo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivar tu propia cuenta de administrador.");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        usuario.setActivo(activo);

        // Si se suspende o da de baja al usuario, sus puestos se pausan automáticamente
        if (!activo && usuario.getEmprendimientos() != null) {
            for (Emprendimiento emp : usuario.getEmprendimientos()) {
                emp.setDisponible(false);
                emprendimientoRepository.save(emp);
            }
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(UsuarioAdminDTO.fromEntity(guardado));
    }

    @GetMapping("/emprendimientos")
    public ResponseEntity<List<EmprendimientoAdminDTO>> getEmprendimientos() {
        List<EmprendimientoAdminDTO> dtos = emprendimientoRepository.findAll().stream()
                .map(EmprendimientoAdminDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/emprendimientos/{id}/disponibilidad")
    public ResponseEntity<EmprendimientoAdminDTO> cambiarDisponibilidadEmprendimiento(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean disponible = body.get("disponible");
        if (disponible == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo 'disponible' es obligatorio.");
        }

        Emprendimiento emp = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emprendimiento no encontrado"));

        emp.setDisponible(disponible);
        Emprendimiento guardado = emprendimientoRepository.save(emp);
        return ResponseEntity.ok(EmprendimientoAdminDTO.fromEntity(guardado));
    }

    @PatchMapping("/emprendimientos/{id}/estado")
    public ResponseEntity<EmprendimientoAdminDTO> cambiarEstadoEmprendimiento(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean activo = body.get("activo");
        if (activo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo 'activo' es obligatorio.");
        }

        Emprendimiento emp = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emprendimiento no encontrado"));

        emp.setActivo(activo);
        if (!activo) {
            emp.setDisponible(false);
        }
        Emprendimiento guardado = emprendimientoRepository.save(emp);
        return ResponseEntity.ok(EmprendimientoAdminDTO.fromEntity(guardado));
    }

    // Eliminación por moderación (Borrado Lógico / Soft Delete: nunca se borra de la base de datos)
    @DeleteMapping("/emprendimientos/{id}")
    public ResponseEntity<Void> eliminarEmprendimientoModeracion(@PathVariable Long id) {
        Emprendimiento emp = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emprendimiento no encontrado"));

        emp.setActivo(false);
        emp.setDisponible(false);
        emprendimientoRepository.save(emp);
        return ResponseEntity.noContent().build();
    }
}
