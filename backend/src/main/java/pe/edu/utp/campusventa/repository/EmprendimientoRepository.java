package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.utp.campusventa.model.Emprendimiento;

public interface EmprendimientoRepository extends JpaRepository<Emprendimiento, Long>, JpaSpecificationExecutor<Emprendimiento> {
}
