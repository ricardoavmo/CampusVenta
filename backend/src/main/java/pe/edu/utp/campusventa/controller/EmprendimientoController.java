package pe.edu.utp.campusventa.controller;

import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.campusventa.dto.ProductoDTO;
import pe.edu.utp.campusventa.dto.ResenaCreateDTO;
import pe.edu.utp.campusventa.exception.ResourceNotFoundException;
import pe.edu.utp.campusventa.model.Categoria;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Producto;
import pe.edu.utp.campusventa.model.Resena;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;

import java.util.ArrayList;
import java.util.List;

// Controlador REST para manejar las operaciones relacionadas con los emprendimientos.

@RestController
@RequestMapping("/api/emprendimientos")
public class EmprendimientoController {

    private final EmprendimientoRepository emprendimientoRepository;
    private final ResenaRepository resenaRepository;
    private final ProductoRepository productoRepository;

    public EmprendimientoController(
            EmprendimientoRepository emprendimientoRepository,
            ResenaRepository resenaRepository,
            ProductoRepository productoRepository) {
        this.emprendimientoRepository = emprendimientoRepository;
        this.resenaRepository = resenaRepository;
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Emprendimiento>> listar(
            @RequestParam(required = false) Categoria categoria,
            @RequestParam(required = false) Boolean disponible,
            @RequestParam(required = false) String search) {

        Specification<Emprendimiento> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoria != null) {
                predicates.add(cb.equal(root.get("categoria"), categoria));
            }
            if (disponible != null) {
                predicates.add(cb.equal(root.get("disponible"), disponible));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nombreMatch = cb.like(cb.lower(root.get("nombre")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("descripcion")), pattern);
                predicates.add(cb.or(nombreMatch, descMatch));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Emprendimiento> resultados = emprendimientoRepository.findAll(spec);
        return ResponseEntity.ok(resultados);
    }

    // Endpoint desarrollado por Ricardo
    @GetMapping("/activos")
    public ResponseEntity<List<Emprendimiento>> listarSoloActivos() {
        List<Emprendimiento> lista = emprendimientoRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    // Endpoint desarrollado por tom09-TK
    @GetMapping("/top")
    public ResponseEntity<List<Emprendimiento>> listarTopCalificados() {
        List<Emprendimiento> lista = emprendimientoRepository.findAll();
        return ResponseEntity.ok(lista);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Emprendimiento> obtenerPorId(@PathVariable Long id) {
        Emprendimiento emprendimiento = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));
        return ResponseEntity.ok(emprendimiento);
    }

    @PostMapping
    public ResponseEntity<Emprendimiento> crear(@Valid @RequestBody Emprendimiento nuevo) {
        Emprendimiento guardado = emprendimientoRepository.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PostMapping("/{id}/resenas")
    @Transactional
    public ResponseEntity<Resena> agregarResena(
            @PathVariable Long id,
            @Valid @RequestBody ResenaCreateDTO dto) {
        Emprendimiento emprendimiento = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        Resena resena = Resena.builder()
                .estudianteNombre(dto.getEstudianteNombre().trim())
                .carreraCiclo(dto.getCarreraCiclo() != null ? dto.getCarreraCiclo().trim() : "Comunidad UTP")
                .calificacion(dto.getCalificacion())
                .comentario(dto.getComentario().trim())
                .verificado(true)
                .emprendimiento(emprendimiento)
                .build();

        Resena guardada = resenaRepository.save(resena);

        // Recalcular promedio de calificación
        List<Resena> todasResenas = resenaRepository.findByEmprendimientoIdOrderByFechaCreacionDesc(id);
        double sum = todasResenas.stream().mapToInt(Resena::getCalificacion).sum();
        double nuevoPromedio = Math.round((sum / todasResenas.size()) * 10.0) / 10.0;
        emprendimiento.setCalificacion(nuevoPromedio);
        emprendimiento.setTotalResenas(todasResenas.size());
        emprendimientoRepository.save(emprendimiento);

        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // Listar productos de un emprendimiento
    @GetMapping("/{id}/productos")
    public ResponseEntity<List<Producto>> listarProductos(@PathVariable Long id) {
        emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));
        List<Producto> productos = productoRepository.findByEmprendimientoId(id);
        return ResponseEntity.ok(productos);
    }

    // Agregar producto con imagen, precio, descripción, stock, badge
    @PostMapping("/{id}/productos")
    @Transactional
    public ResponseEntity<Producto> agregarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoDTO dto) {
        Emprendimiento emprendimiento = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        Producto nuevo = Producto.builder()
                .nombre(dto.getNombre().trim())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .precio(dto.getPrecio())
                .disponible(dto.isDisponible())
                .imagenUrl(dto.getImagenUrl() != null && !dto.getImagenUrl().trim().isEmpty() ? dto.getImagenUrl().trim() : null)
                .badge(dto.getBadge() != null ? dto.getBadge().trim() : null)
                .stock(dto.getStock() != null ? dto.getStock() : 1)
                .emprendimiento(emprendimiento)
                .build();

        Producto guardado = productoRepository.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // Editar todos los campos de un producto
    @PutMapping("/{id}/productos/{productoId}")
    @Transactional
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @PathVariable Long productoId,
            @Valid @RequestBody ProductoDTO dto) {
        emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        Producto producto = productoRepository.findByIdAndEmprendimientoId(productoId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productoId));

        producto.setNombre(dto.getNombre().trim());
        producto.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        producto.setPrecio(dto.getPrecio());
        producto.setDisponible(dto.isDisponible());
        if (dto.getImagenUrl() != null) {
            producto.setImagenUrl(dto.getImagenUrl().trim().isEmpty() ? null : dto.getImagenUrl().trim());
        }
        producto.setBadge(dto.getBadge() != null ? dto.getBadge().trim() : null);
        producto.setStock(dto.getStock() != null ? dto.getStock() : 0);

        Producto actualizado = productoRepository.save(producto);
        return ResponseEntity.ok(actualizado);
    }

    // Eliminar producto
    @DeleteMapping("/{id}/productos/{productoId}")
    @Transactional
    public ResponseEntity<Void> eliminarProducto(
            @PathVariable Long id,
            @PathVariable Long productoId) {
        emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        Producto producto = productoRepository.findByIdAndEmprendimientoId(productoId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productoId));

        productoRepository.delete(producto);
        return ResponseEntity.noContent().build();
    }

    // Actualizar datos del emprendimiento (ubicación en vivo, estado disponible, etc.)
    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<Emprendimiento> actualizarParcial(
            @PathVariable Long id,
            @RequestBody Emprendimiento parcial) {
        Emprendimiento emp = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        if (parcial.getNombre() != null && !parcial.getNombre().trim().isEmpty()) emp.setNombre(parcial.getNombre().trim());
        if (parcial.getDescripcion() != null) emp.setDescripcion(parcial.getDescripcion().trim());
        if (parcial.getTorre() != null) emp.setTorre(parcial.getTorre().trim());
        if (parcial.getPiso() != null) emp.setPiso(parcial.getPiso().trim());
        if (parcial.getWhatsapp() != null) emp.setWhatsapp(parcial.getWhatsapp().trim());
        if (parcial.getAvatarUrl() != null) emp.setAvatarUrl(parcial.getAvatarUrl().trim());
        if (parcial.getTiempoEntrega() != null) emp.setTiempoEntrega(parcial.getTiempoEntrega().trim());
        if (parcial.getHorarioAtencion() != null) emp.setHorarioAtencion(parcial.getHorarioAtencion().trim());
        emp.setDisponible(parcial.isDisponible());

        Emprendimiento guardado = emprendimientoRepository.save(emp);
        return ResponseEntity.ok(guardado);
    }

    // Eliminar emprendimiento completo junto con sus productos y reseñas
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> eliminarEmprendimiento(@PathVariable Long id) {
        Emprendimiento emp = emprendimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprendimiento no encontrado con id: " + id));

        emprendimientoRepository.delete(emp);
        return ResponseEntity.noContent().build();
    }
}
