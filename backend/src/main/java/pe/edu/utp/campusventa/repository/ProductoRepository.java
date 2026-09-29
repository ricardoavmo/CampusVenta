package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.campusventa.model.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByEmprendimientoId(Long emprendimientoId);
    Optional<Producto> findByIdAndEmprendimientoId(Long id, Long emprendimientoId);
}
