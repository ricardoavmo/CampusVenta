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
import pe.edu.utp.campusventa.model.*;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.PedidoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
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
    private ProductoRepository productoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private PedidoController pedidoController;

    private UserPrincipal principal;
    private UserPrincipal duenoPrincipal;
    private UserPrincipal otroPrincipal;
    private UserPrincipal adminPrincipal;

    private Usuario comprador;
    private Usuario dueno;
    private Emprendimiento emprendimiento;
    private Producto producto;

    @BeforeEach
    void setUp() {
        comprador = Usuario.builder()
                .id(1L)
                .nombre("Ricardo Avila")
                .email("u23247043@utp.edu.pe")
                .codigo("U23247043")
                .telefono("51987654321")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();

        dueno = Usuario.builder()
                .id(2L)
                .nombre("Vendedor UTP")
                .email("vendedor@utp.edu.pe")
                .codigo("U20000001")
                .telefono("51999888777")
                .rol(Rol.VENDEDOR)
                .activo(true)
                .build();

        Usuario otroUsuario = Usuario.builder()
                .id(3L)
                .nombre("Usuario Ajeno")
                .email("ajeno@utp.edu.pe")
                .codigo("U20000002")
                .telefono("51911111111")
                .rol(Rol.COMPRADOR)
                .activo(true)
                .build();

        Usuario adminUsuario = Usuario.builder()
                .id(99L)
                .nombre("Administrador UTP")
                .email("admin@utp.edu.pe")
                .codigo("U99999999")
                .telefono("51999999999")
                .rol(Rol.ADMIN)
                .activo(true)
                .build();

        principal = UserPrincipal.create(comprador);
        duenoPrincipal = UserPrincipal.create(dueno);
        otroPrincipal = UserPrincipal.create(otroUsuario);
        adminPrincipal = UserPrincipal.create(adminUsuario);

        emprendimiento = Emprendimiento.builder()
                .id(10L)
                .nombre("Dulces UTP")
                .torre("Torre A")
                .piso("Piso 2")
                .whatsapp("51999888777")
                .disponible(true)
                .propietario(dueno)
                .build();

        producto = Producto.builder()
                .id(50L)
                .nombre("Alfajores Caseros")
                .precio(new BigDecimal("4.50"))
                .disponible(true)
                .emprendimiento(emprendimiento)
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
    @DisplayName("POST /api/pedidos calcula precio y total desde la BD ignorando precio del cliente")
    void testCrearPedido_PrecioTomadoDelServidor() throws Exception {
        when(emprendimientoRepository.findById(10L)).thenReturn(Optional.of(emprendimiento));
        when(productoRepository.findByEmprendimientoIdAndNombreIgnoreCase(10L, "Alfajores Caseros"))
                .thenReturn(Optional.of(producto));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(comprador));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        // El cliente envía precio manipulado (0.01)
        PedidoCreateDTO dto = PedidoCreateDTO.builder()
                .emprendimientoId(10L)
                .productoNombre("Alfajores Caseros")
                .cantidad(2)
                .precioUnitario(new BigDecimal("0.01"))
                .puntoEntrega("Torre A - Piso 2")
                .notas("Por favor con servilletas")
                .build();

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.productoNombre").value("Alfajores Caseros"))
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$.precioUnitario").value(4.50)) // Precio real de la BD
                .andExpect(jsonPath("$.total").value(9.00))         // 4.50 * 2
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    @DisplayName("POST /api/pedidos responde 404 si el producto no existe en el emprendimiento")
    void testCrearPedido_ProductoNoExiste_Responde404() throws Exception {
        when(emprendimientoRepository.findById(10L)).thenReturn(Optional.of(emprendimiento));
        when(productoRepository.findByEmprendimientoIdAndNombreIgnoreCase(10L, "Inexistente"))
                .thenReturn(Optional.empty());

        PedidoCreateDTO dto = PedidoCreateDTO.builder()
                .emprendimientoId(10L)
                .productoNombre("Inexistente")
                .cantidad(1)
                .build();

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/pedidos/mis-pedidos lista pedidos del comprador autenticado")
    void testListarMisPedidos() throws Exception {
        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(comprador)
                .compradorNombre("Ricardo Avila")
                .emprendimiento(emprendimiento)
                .productoNombre("Alfajores Caseros")
                .cantidad(1)
                .precioUnitario(new BigDecimal("4.50"))
                .total(new BigDecimal("4.50"))
                .puntoEntrega("Torre A (Piso 2)")
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findByCompradorIdOrderByFechaCreacionDesc(1L))
                .thenReturn(List.of(pedido));

        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigoPedido").value("ORD-TEST1234"))
                .andExpect(jsonPath("$[0].productoNombre").value("Alfajores Caseros"))
                .andExpect(jsonPath("$[0].tiendaNombre").value("Dulces UTP"));
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado permite transición válida PENDIENTE -> EN_CAMINO al dueño")
    void testActualizarEstado_ValidoPorDueno() throws Exception {
        principal = duenoPrincipal;

        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .productoNombre("Alfajores Caseros")
                .cantidad(1)
                .precioUnitario(new BigDecimal("4.50"))
                .total(new BigDecimal("4.50"))
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.EN_CAMINO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_CAMINO"));
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado responde 400 en transición inválida (PENDIENTE -> ENTREGADO)")
    void testActualizarEstado_TransicionInvalida_Responde400() throws Exception {
        principal = duenoPrincipal;

        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .productoNombre("Alfajores Caseros")
                .cantidad(1)
                .precioUnitario(new BigDecimal("4.50"))
                .total(new BigDecimal("4.50"))
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        // Transición inválida: de PENDIENTE directo a ENTREGADO
        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.ENTREGADO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado responde 400 si el pedido ya está en estado final ENTREGADO")
    void testActualizarEstado_EstadoFinal_Responde400() throws Exception {
        principal = duenoPrincipal;

        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-TEST1234")
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .productoNombre("Alfajores Caseros")
                .cantidad(1)
                .precioUnitario(new BigDecimal("4.50"))
                .total(new BigDecimal("4.50"))
                .estado(EstadoPedido.ENTREGADO)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.PENDIENTE);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado responde 403 si un usuario ajeno intenta modificar el pedido")
    void testActualizarEstado_UsuarioAjeno_Responde403() throws Exception {
        principal = otroPrincipal;

        Pedido pedido = Pedido.builder()
                .id(100L)
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.CANCELADO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado permite al comprador cancelar su pedido en PENDIENTE")
    void testActualizarEstado_CompradorCancelaPendiente_Ok() throws Exception {
        principal = UserPrincipal.create(comprador);

        Pedido pedido = Pedido.builder()
                .id(100L)
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.CANCELADO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADO"));
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado responde 403 si el comprador intenta avanzar el estado a EN_CAMINO")
    void testActualizarEstado_CompradorIntentaAvanzar_Responde403() throws Exception {
        principal = UserPrincipal.create(comprador);

        Pedido pedido = Pedido.builder()
                .id(100L)
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        PedidoEstadoUpdateDTO updateDTO = new PedidoEstadoUpdateDTO(EstadoPedido.EN_CAMINO);

        mockMvc.perform(patch("/api/pedidos/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/pedidos/{id} responde 403 a un usuario ajeno")
    void testObtenerPorId_UsuarioAjeno_Responde403() throws Exception {
        principal = otroPrincipal;

        Pedido pedido = Pedido.builder()
                .id(100L)
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        mockMvc.perform(get("/api/pedidos/100"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/pedidos/{id} responde 200 al comprador del pedido")
    void testObtenerPorId_Comprador_Responde200() throws Exception {
        principal = UserPrincipal.create(comprador);

        Pedido pedido = Pedido.builder()
                .id(100L)
                .codigoPedido("ORD-ABC12345")
                .comprador(comprador)
                .emprendimiento(emprendimiento)
                .productoNombre("Alfajores Caseros")
                .cantidad(2)
                .precioUnitario(new BigDecimal("4.50"))
                .total(new BigDecimal("9.00"))
                .estado(EstadoPedido.PENDIENTE)
                .build();

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));

        mockMvc.perform(get("/api/pedidos/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.codigoPedido").value("ORD-ABC12345"));
    }

    @Test
    @DisplayName("GET /api/pedidos/vendedor/{id} responde 403 si el puesto no tiene dueño y el llamador no es ADMIN")
    void testListarPedidosVendedor_SinDuenoYNoAdmin_Responde403() throws Exception {
        principal = otroPrincipal;

        Emprendimiento empSinDueno = Emprendimiento.builder()
                .id(20L)
                .nombre("Puesto Sin Dueño")
                .propietario(null)
                .build();

        when(emprendimientoRepository.findById(20L)).thenReturn(Optional.of(empSinDueno));

        mockMvc.perform(get("/api/pedidos/vendedor/20"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/pedidos/vendedor/{id} permite al ADMIN ver pedidos de un puesto sin dueño")
    void testListarPedidosVendedor_SinDuenoPermitidoParaAdmin() throws Exception {
        principal = adminPrincipal;

        Emprendimiento empSinDueno = Emprendimiento.builder()
                .id(20L)
                .nombre("Puesto Sin Dueño")
                .propietario(null)
                .build();

        when(emprendimientoRepository.findById(20L)).thenReturn(Optional.of(empSinDueno));
        when(pedidoRepository.findByEmprendimientoIdOrderByFechaCreacionDesc(20L)).thenReturn(List.of());

        mockMvc.perform(get("/api/pedidos/vendedor/20"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pedidos/999 devuelve 404 si el pedido no existe")
    void testPedidoNoEncontrado() throws Exception {
        when(pedidoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/pedidos/999"))
                .andExpect(status().isNotFound());
    }
}
