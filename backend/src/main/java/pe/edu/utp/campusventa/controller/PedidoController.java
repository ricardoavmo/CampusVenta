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
import pe.edu.utp.campusventa.model.Producto;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.PedidoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
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
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(
            PedidoRepository pedidoRepository,
            EmprendimientoRepository emprendimientoRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.emprendimientoRepository = emprendimientoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Crear un nuevo pedido en el campus (precio tomado obligatoriamente del servidor)
    @PostMapping
    @Transactional
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody PedidoCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Emprendimiento emp = emprendimientoRepository.findById(dto.getEmprendimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + dto.getEmprendimientoId()));

        // Buscar producto en la base de datos por emprendimiento e ID o nombre
        Producto producto = null;
        if (dto.getProductoId() != null) {
            producto = productoRepository.findByIdAndEmprendimientoId(dto.getProductoId(), emp.getId())
                    .orElse(null);
        }
        if (producto == null && dto.getProductoNombre() != null && !dto.getProductoNombre().isBlank()) {
            producto = productoRepository.findByEmprendimientoIdAndNombreIgnoreCase(emp.getId(), dto.getProductoNombre().trim())
                    .orElse(null);
        }

        if (producto == null) {
            throw new ResourceNotFoundException("Producto no encontrado en el emprendimiento especificado");
        }

        // El precio y total se calculan estrictamente con el precio del servidor
        BigDecimal precioUnitario = producto.getPrecio();
        BigDecimal total = precioUnitario.multiply(BigDecimal.valueOf(dto.getCantidad()));

        Usuario comprador = usuarioRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + currentUser.getId()));

        String compradorNombre = comprador.getNombre();
        String compradorTelefono = dto.getCompradorTelefono();
        if (compradorTelefono == null || compradorTelefono.isBlank()) {
            compradorTelefono = comprador.getTelefono();
        }

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
                .productoNombre(producto.getNombre())
                .cantidad(dto.getCantidad())
                .precioUnitario(precioUnitario)
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

    // Listar pedidos recibidos por un emprendimiento (para el vendedor dueño o ADMIN)
    @GetMapping("/vendedor/{emprendimientoId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosVendedor(
            @PathVariable Long emprendimientoId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Emprendimiento emp = emprendimientoRepository.findById(emprendimientoId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + emprendimientoId));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Si el puesto no tiene propietario o el usuario no es el dueño, solo ADMIN puede verlo
        if (!isAdmin) {
            if (emp.getPropietario() == null || !emp.getPropietario().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver los pedidos de este puesto");
            }
        }

        List<Pedido> pedidos = pedidoRepository.findByEmprendimientoIdOrderByFechaCreacionDesc(emprendimientoId);
        List<PedidoResponseDTO> dtos = pedidos.stream().map(PedidoResponseDTO::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Actualizar estado del pedido con control estricto de transiciones y permisos
    @PatchMapping("/{id}/estado")
    @Transactional
    public ResponseEntity<PedidoResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody PedidoEstadoUpdateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con id: " + id));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = pedido.getEmprendimiento() != null
                && pedido.getEmprendimiento().getPropietario() != null
                && pedido.getEmprendimiento().getPropietario().getId().equals(currentUser.getId());
        boolean isBuyer = pedido.getComprador() != null
                && pedido.getComprador().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner && !isBuyer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este pedido");
        }

        // Si es comprador (y no dueño ni admin): solo puede cancelar si está PENDIENTE
        if (isBuyer && !isOwner && !isAdmin) {
            if (dto.getEstado() != EstadoPedido.CANCELADO) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El comprador solo puede cancelar su propio pedido");
            }
            if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comprador solo puede cancelar pedidos en estado PENDIENTE");
            }
        } else {
            // Es propietario o ADMIN: validar transiciones de estado
            EstadoPedido actual = pedido.getEstado();
            EstadoPedido nuevo = dto.getEstado();

            if (actual == EstadoPedido.ENTREGADO || actual == EstadoPedido.CANCELADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El pedido ya está en estado final (" + actual + ") y no puede modificarse");
            }

            boolean transicionValida = false;
            if (actual == EstadoPedido.PENDIENTE) {
                transicionValida = (nuevo == EstadoPedido.EN_CAMINO || nuevo == EstadoPedido.CANCELADO);
            } else if (actual == EstadoPedido.EN_CAMINO) {
                transicionValida = (nuevo == EstadoPedido.ENTREGADO || nuevo == EstadoPedido.CANCELADO);
            }

            if (!transicionValida) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Transición de estado inválida de " + actual + " a " + nuevo);
            }
        }

        pedido.setEstado(dto.getEstado());
        Pedido actualizado = pedidoRepository.save(pedido);
        return ResponseEntity.ok(PedidoResponseDTO.fromEntity(actualizado));
    }

    // Detalle de un pedido: solo visible para el comprador, el propietario del puesto o ADMIN
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> obtenerPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con id: " + id));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = pedido.getEmprendimiento() != null
                && pedido.getEmprendimiento().getPropietario() != null
                && pedido.getEmprendimiento().getPropietario().getId().equals(currentUser.getId());
        boolean isBuyer = pedido.getComprador() != null
                && pedido.getComprador().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner && !isBuyer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver este pedido");
        }

        return ResponseEntity.ok(PedidoResponseDTO.fromEntity(pedido));
    }
}
