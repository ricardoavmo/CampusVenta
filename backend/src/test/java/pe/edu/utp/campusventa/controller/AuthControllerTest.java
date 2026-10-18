package pe.edu.utp.campusventa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.utp.campusventa.dto.LoginRequestDTO;
import pe.edu.utp.campusventa.dto.RegistroRequestDTO;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.CustomUserDetailsService;
import pe.edu.utp.campusventa.security.JwtAuthenticationEntryPoint;
import pe.edu.utp.campusventa.security.JwtTokenProvider;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("Registro con correo no @utp.edu.pe debe ser rechazado con 400")
    void testRegistroEmailInvalido() throws Exception {
        RegistroRequestDTO dto = new RegistroRequestDTO();
        dto.setNombre("Juan Perez");
        dto.setEmail("juan@gmail.com");
        dto.setCodigo("U20210045");
        dto.setPassword("Secret123!");

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.email", containsString("utp.edu.pe")));
    }

    @Test
    @DisplayName("Registro con código que no inicia con U o longitud distinta a 8 dígitos debe devolver 400")
    void testRegistroCodigoInvalido() throws Exception {
        RegistroRequestDTO dto = new RegistroRequestDTO();
        dto.setNombre("Juan Perez");
        dto.setEmail("u20210045@utp.edu.pe");
        dto.setCodigo("12345");
        dto.setPassword("Secret123!");

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.codigo", containsString("U")));
    }

    @Test
    @DisplayName("Registro válido crea usuario con rol COMPRADOR y responde 201 con token JWT")
    void testRegistroValido() throws Exception {
        RegistroRequestDTO dto = new RegistroRequestDTO();
        dto.setNombre("Juan Perez");
        dto.setEmail("u20210045@utp.edu.pe");
        dto.setCodigo("U20210045");
        dto.setPassword("Secret123!");

        when(usuarioRepository.existsByEmailIgnoreCase("u20210045@utp.edu.pe")).thenReturn(false);
        when(usuarioRepository.existsByCodigoIgnoreCase("U20210045")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("hashedPassword");

        Usuario savedUser = Usuario.builder()
                .id(1L)
                .nombre("Juan Perez")
                .email("u20210045@utp.edu.pe")
                .codigo("U20210045")
                .password("hashedPassword")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenFromUser(any(Usuario.class))).thenReturn("fake-jwt-token");

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.usuario.email").value("u20210045@utp.edu.pe"))
                .andExpect(jsonPath("$.usuario.rol").value("COMPRADOR"));
    }

    @Test
    @DisplayName("Login con credenciales incorrectas responde 401")
    void testLoginInvalido() throws Exception {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setIdentificador("u20210045@utp.edu.pe");
        dto.setPassword("WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Credenciales")));
    }
}
