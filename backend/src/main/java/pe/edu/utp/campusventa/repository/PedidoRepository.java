package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.utp.campusventa.model.Pedido;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT p FROM Pedido p WHERE p.comprador.id = :compradorId ORDER BY p.fechaCreacion DESC")
    List<Pedido> findByCompradorIdOrderByFechaCreacionDesc(@Param("compradorId") Long compradorId);

    @Query("SELECT p FROM Pedido p WHERE p.emprendimiento.id = :emprendimientoId ORDER BY p.fechaCreacion DESC")
    List<Pedido> findByEmprendimientoIdOrderByFechaCreacionDesc(@Param("emprendimientoId") Long emprendimientoId);

    Optional<Pedido> findByCodigoPedido(String codigoPedido);
}
