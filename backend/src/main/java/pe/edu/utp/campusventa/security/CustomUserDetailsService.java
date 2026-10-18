package pe.edu.utp.campusventa.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmailOrCode) throws UsernameNotFoundException {
        String cleanInput = usernameOrEmailOrCode.trim();
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(cleanInput)
                .or(() -> usuarioRepository.findByCodigoIgnoreCase(cleanInput))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo o código: " + cleanInput));

        return UserPrincipal.create(usuario);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con ID: " + id));

        return UserPrincipal.create(usuario);
    }
}
