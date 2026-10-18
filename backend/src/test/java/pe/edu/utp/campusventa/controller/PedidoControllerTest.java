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
import pe.edu.utp.campusventa.dto.PedidoCreateDTO;
import pe.edu.utp.campusventa.dto.PedidoEstadoUpdateDTO;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.EstadoPedido;
import pe.edu.utp.campusventa.model.Pedido;
import pe.edu.utp.campusventa.model.Rol;
import pe.edu.utp.campusventa.model.Usuario;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.PedidoRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;
import pe.edu.utp.campusventa.security.UserPrincipal;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private EmprendimientoRepository emprendimientoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private PedidoController pedidoController;

    private UserPrincipal principal;
    private Usuario usuario;
    private Emprendimiento emprendimiento;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nombre("Ricardo Avila")
                .email("u23247043@utp.edu.pe")
                .codigo("U23247043")
                .telefono("51987654321")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();

        principal = UserPrincipal.create(usuario);

        emprendimiento = Emprendimiento.builder()
                .id(10L)
                .nombre("Dulces UTP")
                .torre("Torre A")
                .piso("Piso 2")
                .whatsapp("51999888777")
                .disponible(true)
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(pedidoController)
                .setControllerAdvice(new pe.edu.utp.campusventa.exception.GlobalExceptionHandler())
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
    @DisplayName("POST /api/pedidos crea pedido exitosamente y responde 201")
    void testCrearPedido() throws Exception {
        when(emprendimientoRepository.findById(10L)).thenReturn(Optional.of(emprendimiento));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        PedidoCreateDTO dto = PedidoCreateDTO.builder()
                .emprendimientoId(10L)
                .productoNombre("Alfajores Caseros")
                .cantidad(2)
                .precioUnitario(new BigDecimal("3.50"))
                .puntoEntrega("Torre A - Piso 2")
                .notas("Por favor con servilletas")
                .compradorTelefono("51987654321")
                .build();

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.productoNombre").value("Alfajores Caseros"))
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$.precioUnitario").value(3.50))
                .andExpect(jsonPath("$.total").value(7.00))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.codigoPedido").exists());
    }

    @Test
    @DisplayName("GET /api/pedidos/mis-pedidos lista pedidos del comprador autenticado")
    void testListarMisPedidos() throws Exception {
        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(usuario)
                .compradorNombre("Ricardo Avila")
                .emprendimiento(emprendimiento)
                .productoNombre("Brownie de Chocolate")
                .cantidad(1)
                .precioUnitario(new BigDecimal("5.00"))
                .total(new BigDecimal("5.00"))
                .puntoEntrega("Torre A (Piso 2)")
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findByCompradorIdOrderByFechaCreacionDesc(1L))
                .thenReturn(List.of(pedido));

        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigoPedido").value("ORD-TEST1234"))
                .andExpect(jsonPath("$[0].productoNombre").value("Brownie de Chocolate"))
                .andExpect(jsonPath("$[0].tiendaNombre").value("Dulces UTP"));
    }

    @Test
    @DisplayName("PATCH /api/pedidos/100/estado actualiza el estado del pedido")
    void testActualizarEstado() throws Exception {
        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(usuario)
                .emprendimiento(emprendimiento)
                .productoNombre("Brownie de Chocolate")
                .cantidad(1)
                .precioUnitario(new BigDecimal("5.00"))
                .total(new BigDecimal("5.00"))
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.ENTREGADO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENTREGADO"));
    }

    @Test
    @DisplayName("GET /api/pedidos/999 devuelve 404 si el pedido no existe")
    void testPedidoNoEncontrado() throws Exception {
        when(pedidoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/pedidos/999"))
                .andExpect(status().isNotFound());
    }
}
