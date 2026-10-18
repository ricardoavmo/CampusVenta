package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.utp.campusventa.model.Resena;

import java.util.List;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

    @Query("SELECT r FROM Resena r WHERE r.emprendimiento.id = :emprendimientoId ORDER BY r.fechaCreacion DESC")
    List<Resena> findByEmprendimientoIdOrderByFechaCreacionDesc(@Param("emprendimientoId") Long emprendimientoId);

    @Query("SELECT r FROM Resena r WHERE r.usuario.id = :usuarioId ORDER BY r.fechaCreacion DESC")
    List<Resena> findByUsuarioIdOrderByFechaCreacionDesc(@Param("usuarioId") Long usuarioId);
}
