package pe.edu.utp.campusventa.controller;

import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.campusventa.dto.ResenaCreateDTO;
import pe.edu.utp.campusventa.exception.ResourceNotFoundException;
import pe.edu.utp.campusventa.model.Categoria;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Resena;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/emprendimientos")
public class EmprendimientoController {

    private final EmprendimientoRepository emprendimientoRepository;
    private final ResenaRepository resenaRepository;

    public EmprendimientoController(EmprendimientoRepository emprendimientoRepository,
            ResenaRepository resenaRepository) {
        this.emprendimientoRepository = emprendimientoRepository;
        this.resenaRepository = resenaRepository;
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
}
