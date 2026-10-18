package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.utp.campusventa.model.Emprendimiento;

import java.util.List;

public interface EmprendimientoRepository extends JpaRepository<Emprendimiento, Long>, JpaSpecificationExecutor<Emprendimiento> {
    List<Emprendimiento> findByPropietarioId(Long propietarioId);
    List<Emprendimiento> findByPropietarioIdAndActivoTrue(Long propietarioId);
    List<Emprendimiento> findByActivoTrue();
}
