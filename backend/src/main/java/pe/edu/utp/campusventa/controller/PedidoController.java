package pe.edu.utp.campusventa.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.campusventa.dto.PedidoCreateDTO;
import pe.edu.utp.campusventa.dto.PedidoEstadoUpdateDTO;
import pe.edu.utp.campusventa.dto.PedidoResponseDTO;
import pe.edu.utp.campusventa.exception.ResourceNotFoundException;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.EstadoPedido;
import pe.edu.utp.campusventa.model.Pedido;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.PedidoRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.UserPrincipal;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final EmprendimientoRepository emprendimientoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(
            PedidoRepository pedidoRepository,
            EmprendimientoRepository emprendimientoRepository,
            UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.emprendimientoRepository = emprendimientoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Crear un nuevo pedido en el campus
    @PostMapping
    @Transactional
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody PedidoCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Emprendimiento emp = emprendimientoRepository.findById(dto.getEmprendimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + dto.getEmprendimientoId()));

        Usuario comprador = null;
        String compradorNombre = "Estudiante UTP";
        String compradorTelefono = dto.getCompradorTelefono();

        if (currentUser != null) {
            comprador = usuarioRepository.findById(currentUser.getId()).orElse(null);
            if (comprador != null) {
                compradorNombre = comprador.getNombre();
                if (compradorTelefono == null || compradorTelefono.isBlank()) {
                    compradorTelefono = comprador.getTelefono();
                }
            }
        }

        BigDecimal total = dto.getPrecioUnitario().multiply(BigDecimal.valueOf(dto.getCantidad()));
        String codigo = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String puntoEntrega = dto.getPuntoEntrega();
        if (puntoEntrega == null || puntoEntrega.isBlank()) {
            puntoEntrega = emp.getTorre() + " (" + emp.getPiso() + ")";
        }

        Pedido pedido = Pedido.builder()
                .codigoPedido(codigo)
                .comprador(comprador)
                .compradorNombre(compradorNombre)
                .compradorTelefono(compradorTelefono)
                .emprendimiento(emp)
                .productoNombre(dto.getProductoNombre().trim())
                .cantidad(dto.getCantidad())
                .precioUnitario(dto.getPrecioUnitario())
                .total(total)
                .puntoEntrega(puntoEntrega)
                .estado(EstadoPedido.PENDIENTE)
                .notas(dto.getNotas() != null ? dto.getNotas().trim() : null)
                .build();

        Pedido guardado = pedidoRepository.save(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(PedidoResponseDTO.fromEntity(guardado));
    }

    // Listar pedidos del usuario autenticado (comprador)
    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<PedidoResponseDTO>> listarMisPedidos(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        List<Pedido> pedidos = pedidoRepository.findByCompradorIdOrderByFechaCreacionDesc(currentUser.getId());
        List<PedidoResponseDTO> dtos = pedidos.stream().map(PedidoResponseDTO::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Listar pedidos recibidos por un emprendimiento (para el vendedor)
    @GetMapping("/vendedor/{emprendimientoId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosVendedor(
            @PathVariable Long emprendimientoId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Emprendimiento emp = emprendimientoRepository.findById(emprendimientoId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + emprendimientoId));

        // Validar propiedad si no es admin
        if (emp.getPropietario() != null && !emp.getPropietario().getId().equals(currentUser.getId())
                && currentUser.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver los pedidos de este puesto");
        }

        List<Pedido> pedidos = pedidoRepository.findByEmprendimientoIdOrderByFechaCreacionDesc(emprendimientoId);
        List<PedidoResponseDTO> dtos = pedidos.stream().map(PedidoResponseDTO::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Actualizar estado del pedido (PENDIENTE -> EN_CAMINO -> ENTREGADO -> CANCELADO)
    @PatchMapping("/{id}/estado")
    @Transactional
    public ResponseEntity<PedidoResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody PedidoEstadoUpdateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con id: " + id));

        pedido.setEstado(dto.getEstado());
        Pedido actualizado = pedidoRepository.save(pedido);
        return ResponseEntity.ok(PedidoResponseDTO.fromEntity(actualizado));
    }

    // Detalle de un pedido
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> obtenerPorId(@PathVariable Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con id: " + id));
        return ResponseEntity.ok(PedidoResponseDTO.fromEntity(pedido));
    }
}
