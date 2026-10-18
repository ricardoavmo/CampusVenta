package pe.edu.utp.campusventa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.CustomUserDetailsService;
import pe.edu.utp.campusventa.security.JwtAuthenticationEntryPoint;
import pe.edu.utp.campusventa.security.JwtTokenProvider;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private EmprendimientoRepository emprendimientoRepository;

    @MockitoBean
    private ProductoRepository productoRepository;

    @MockitoBean
    private ResenaRepository resenaRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("GET /api/admin/metricas responde 200 con totales calculados")
    void testGetMetricas() throws Exception {
        Usuario u1 = Usuario.builder().id(1L).nombre("Admin").rol(Rol.ADMIN).activo(true).build();
        Usuario u2 = Usuario.builder().id(2L).nombre("Vendedor").rol(Rol.VENDEDOR).activo(true).build();
        Usuario u3 = Usuario.builder().id(3L).nombre("Comprador").rol(Rol.COMPRADOR).activo(true).build();

        Emprendimiento e1 = Emprendimiento.builder().id(1L).nombre("Postres UTP").disponible(true).calificacion(4.5).build();

        when(usuarioRepository.findAll()).thenReturn(List.of(u1, u2, u3));
        when(emprendimientoRepository.findAll()).thenReturn(List.of(e1));
        when(productoRepository.count()).thenReturn(5L);
        when(resenaRepository.count()).thenReturn(2L);

        mockMvc.perform(get("/api/admin/metricas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsuarios").value(3))
                .andExpect(jsonPath("$.totalVendedores").value(1))
                .andExpect(jsonPath("$.totalCompradores").value(1))
                .andExpect(jsonPath("$.totalAdmins").value(1))
                .andExpect(jsonPath("$.totalProductos").value(5))
                .andExpect(jsonPath("$.totalResenas").value(2));
    }

    @Test
    @DisplayName("GET /api/admin/usuarios responde 200 con lista de usuarios DTO")
    void testGetUsuarios() throws Exception {
        Usuario u = Usuario.builder()
                .id(1L)
                .nombre("Kelvin Cienfuegos")
                .email("u20210045@utp.edu.pe")
                .codigo("U20210045")
                .rol(Rol.VENDEDOR)
                .activo(true)
                .build();

        when(usuarioRepository.findAll()).thenReturn(List.of(u));

        mockMvc.perform(get("/api/admin/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Kelvin Cienfuegos"))
                .andExpect(jsonPath("$[0].codigo").value("U20210045"))
                .andExpect(jsonPath("$[0].rol").value("VENDEDOR"));
    }

    @Test
    @DisplayName("PATCH /api/admin/usuarios/1/rol actualiza rol y responde 200")
    void testUpdateUsuarioRol() throws Exception {
        Usuario u = Usuario.builder()
                .id(1L)
                .nombre("Toom Carmen")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(u));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/admin/usuarios/1/rol")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("rol", "VENDEDOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("VENDEDOR"));
    }

    @Test
    @DisplayName("PATCH /api/admin/usuarios/1/estado actualiza estado activo (soft delete / reactivar)")
    void testUpdateUsuarioEstado() throws Exception {
        Usuario u = Usuario.builder()
                .id(1L)
                .nombre("Usuario Prueba")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(u));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/admin/usuarios/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("activo", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));
    }
}
