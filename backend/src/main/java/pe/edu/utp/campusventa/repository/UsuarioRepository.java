package pe.edu.utp.campusventa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.campusventa.model.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    Optional<Usuario> findByCodigoIgnoreCase(String codigo);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCodigoIgnoreCase(String codigo);
}
