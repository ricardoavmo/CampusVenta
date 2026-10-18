package pe.edu.utp.campusventa.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.campusventa.dto.UsuarioResponseDTO;
import pe.edu.utp.campusventa.dto.UsuarioUpdateRequestDTO;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Resena;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final ResenaRepository resenaRepository;
    private final EmprendimientoRepository emprendimientoRepository;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            ResenaRepository resenaRepository,
            EmprendimientoRepository emprendimientoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.resenaRepository = resenaRepository;
        this.emprendimientoRepository = emprendimientoRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMiPerfil(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuario));
    }

    @GetMapping("/me/resenas")
    public ResponseEntity<List<Resena>> getMisResenas(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        List<Resena> misResenas =
                resenaRepository.findByUsuarioIdOrderByFechaCreacionDesc(principal.getId());
        return ResponseEntity.ok(misResenas);
    }

    @GetMapping("/me/favoritos")
    public ResponseEntity<List<Long>> getMisFavoritos(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        List<Long> ids = usuario.getFavoritos().stream()
                .map(Emprendimiento::getId)
                .toList();
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/me/favoritos/{emprendimientoId}")
    public ResponseEntity<List<Long>> toggleFavorito(
            @PathVariable Long emprendimientoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Emprendimiento emp = emprendimientoRepository.findById(emprendimientoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emprendimiento no encontrado"));

        boolean removed = usuario.getFavoritos().removeIf(e -> e.getId().equals(emprendimientoId));
        if (!removed) {
            usuario.getFavoritos().add(emp);
        }
        usuarioRepository.save(usuario);

        List<Long> ids = usuario.getFavoritos().stream()
                .map(Emprendimiento::getId)
                .toList();
        return ResponseEntity.ok(ids);
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> actualizarMiPerfil(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UsuarioUpdateRequestDTO dto) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (dto.getNombre() != null && !dto.getNombre().trim().isEmpty()) {
            usuario.setNombre(dto.getNombre().trim());
        }
        if (dto.getCarrera() != null) {
            usuario.setCarrera(dto.getCarrera().trim());
        }
        if (dto.getCiclo() != null) {
            usuario.setCiclo(dto.getCiclo().trim());
        }
        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono().trim());
        }
        if (dto.getAvatarUrl() != null) {
            usuario.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getBio() != null) {
            usuario.setBio(dto.getBio().trim());
        }
        if (dto.getRedesSocialesJson() != null) {
            usuario.setRedesSocialesJson(dto.getRedesSocialesJson());
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(guardado));
    }

    // Desactivar / dar de baja la propia cuenta (Borrado Lógico / Soft Delete)
    @DeleteMapping("/me")
    public ResponseEntity<Void> desactivarMiCuenta(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        usuario.setActivo(false);
        if (usuario.getEmprendimientos() != null) {
            for (Emprendimiento emp : usuario.getEmprendimientos()) {
                emp.setDisponible(false);
            }
        }
        usuarioRepository.save(usuario);
        return ResponseEntity.noContent().build();
    }
}
