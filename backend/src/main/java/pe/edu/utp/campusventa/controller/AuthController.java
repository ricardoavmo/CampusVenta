package pe.edu.utp.campusventa.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.campusventa.dto.AuthResponseDTO;
import pe.edu.utp.campusventa.dto.LoginRequestDTO;
import pe.edu.utp.campusventa.dto.RegistroRequestDTO;
import pe.edu.utp.campusventa.dto.UsuarioResponseDTO;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.JwtTokenProvider;
import pe.edu.utp.campusventa.security.UserPrincipal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        String codigo = dto.getCodigo().trim().toUpperCase();

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo electrónico institucional ya se encuentra registrado.");
        }

        if (usuarioRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El código de estudiante ya se encuentra registrado.");
        }

        Rol rolAsignado = Rol.COMPRADOR;

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre().trim())
                .email(email)
                .codigo(codigo)
                .password(passwordEncoder.encode(dto.getPassword()))
                .rol(rolAsignado)
                .carrera(dto.getCarrera() != null ? dto.getCarrera().trim() : null)
                .ciclo(dto.getCiclo() != null ? dto.getCiclo().trim() : null)
                .telefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null)
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        String token = tokenProvider.generateTokenFromUser(guardado);

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .tipoToken("Bearer")
                .usuario(UsuarioResponseDTO.fromEntity(guardado))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        String identificador = dto.getIdentificador().trim();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(identificador)
                .or(() -> usuarioRepository.findByCodigoIgnoreCase(identificador))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas: correo o código no encontrado."));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta de estudiante se encuentra inactiva o dada de baja.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas: contraseña incorrecta.");
        }

        String token = tokenProvider.generateTokenFromUser(usuario);

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .tipoToken("Bearer")
                .usuario(UsuarioResponseDTO.fromEntity(usuario))
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponseDTO> adminLogin(@Valid @RequestBody LoginRequestDTO dto) {
        String identificador = dto.getIdentificador().trim();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(identificador)
                .or(() -> usuarioRepository.findByCodigoIgnoreCase(identificador))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales de administrador inválidas."));

        if (usuario.getRol() != Rol.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: esta consola es de acceso exclusivo para personal administrativo de CampusVenta.");
        }

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta de administrador se encuentra inactiva o dada de baja.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales de administrador inválidas.");
        }

        String token = tokenProvider.generateTokenFromUser(usuario);

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .tipoToken("Bearer")
                .usuario(UsuarioResponseDTO.fromEntity(usuario))
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfilAutenticado(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No has iniciado sesión o tu sesión ha expirado.");
        }

        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuario));
    }
}
