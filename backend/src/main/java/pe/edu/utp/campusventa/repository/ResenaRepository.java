package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.campusventa.model.Resena;

import java.util.List;

public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByEmprendimientoIdOrderByFechaCreacionDesc(Long emprendimientoId);
}
