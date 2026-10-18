package pe.edu.utp.campusventa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import pe.edu.utp.campusventa.dto.UsuarioUpdateRequestDTO;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Resena;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.ResenaRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.UserPrincipal;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ResenaRepository resenaRepository;

    @InjectMocks
    private UsuarioController usuarioController;

    private UserPrincipal principal;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nombre("Ricardo Avila")
                .email("u23247043@utp.edu.pe")
                .codigo("U23247043")
                .carrera("Ingeniería de Sistemas")
                .ciclo("VI")
                .telefono("51987654321")
                .rol(Rol.VENDEDOR)
                .activo(true)
                .build();

        principal = UserPrincipal.create(usuario);

        mockMvc = MockMvcBuilders.standaloneSetup(usuarioController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().equals(UserPrincipal.class)
                                || parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return principal;
                    }
                })
                .build();
    }

    @Test
    @DisplayName("GET /api/usuarios/me responde 200 con datos del usuario autenticado")
    void testGetMiPerfil() throws Exception {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Ricardo Avila"))
                .andExpect(jsonPath("$.email").value("u23247043@utp.edu.pe"))
                .andExpect(jsonPath("$.rol").value("VENDEDOR"));
    }

    @Test
    @DisplayName("PUT /api/usuarios/me actualiza datos de perfil y responde 200")
    void testActualizarMiPerfil() throws Exception {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioUpdateRequestDTO updateDTO = new UsuarioUpdateRequestDTO();
        updateDTO.setNombre("Ricardo Avila Montalbán");
        updateDTO.setCarrera("Ingeniería de Sistemas e Informática");
        updateDTO.setCiclo("VII");
        updateDTO.setTelefono("51999888777");

        mockMvc.perform(put("/api/usuarios/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Ricardo Avila Montalbán"))
                .andExpect(jsonPath("$.carrera").value("Ingeniería de Sistemas e Informática"))
                .andExpect(jsonPath("$.ciclo").value("VII"));
    }

    @Test
    @DisplayName("DELETE /api/usuarios/me desactiva la cuenta (baja lógica) y responde 204")
    void testDesactivarMiCuenta() throws Exception {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(delete("/api/usuarios/me"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/usuarios/me/resenas responde 200 con lista de resenas del usuario")
    void testGetMisResenas() throws Exception {
        Emprendimiento emp = Emprendimiento.builder().id(10L).nombre("Chifles Piuranos").build();

        Resena resena = Resena.builder()
                .id(100L)
                .estudianteNombre("Ricardo Avila")
                .calificacion(5)
                .comentario("Muy buenos chifles y entrega puntual en Torre A")
                .emprendimiento(emp)
                .usuario(usuario)
                .build();

        when(resenaRepository.findByUsuarioIdOrderByFechaCreacionDesc(1L))
                .thenReturn(List.of(resena));

        mockMvc.perform(get("/api/usuarios/me/resenas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estudianteNombre").value("Ricardo Avila"))
                .andExpect(jsonPath("$[0].calificacion").value(5))
                .andExpect(jsonPath("$[0].comentario").value("Muy buenos chifles y entrega puntual en Torre A"));
    }
}
