package pe.edu.utp.campusventa.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.utp.campusventa.model.Categoria;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ResenaRepository;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmprendimientoController.class)
class EmprendimientoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmprendimientoRepository emprendimientoRepository;

    @MockBean
    private ResenaRepository resenaRepository;

    @Test
    @DisplayName("GET /api/emprendimientos debe responder 200 y contener elementos")
    @SuppressWarnings("unchecked")
    void testListarEmprendimientos() throws Exception {
        Emprendimiento mockItem = Emprendimiento.builder()
                .id(1L)
                .nombre("Brownies Test")
                .categoria(Categoria.POSTRES)
                .disponible(true)
                .torre("Torre A")
                .piso("Piso 3")
                .descripcion("Ricos brownies")
                .precioDesde(new BigDecimal("4.50"))
                .whatsapp("51969123456")
                .build();
        when(emprendimientoRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(mockItem));

        mockMvc.perform(get("/api/emprendimientos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].nombre").value("Brownies Test"));
    }

    @Test
    @DisplayName("GET /api/emprendimientos/999 inexistente debe devolver 404 estructurado")
    void testEmprendimientoNoEncontrado() throws Exception {
        when(emprendimientoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/emprendimientos/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message", containsString("no encontrado")));
    }

    @Test
    @DisplayName("POST /api/emprendimientos con categoría inválida en JSON debe responder 400 (no 500)")
    void testCategoriaInvalidaDevuelve400() throws Exception {
        String jsonConCategoriaInvalida = """
                {
                    "nombre": "Test Invalido",
                    "categoria": "CATEGORIA_INVENTADA",
                    "disponible": true,
                    "torre": "Torre A",
                    "piso": "Piso 1",
                    "descripcion": "Descripcion de prueba",
                    "precioDesde": 5.0,
                    "whatsapp": "51987654321"
                }
                """;

        mockMvc.perform(post("/api/emprendimientos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonConCategoriaInvalida))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message", containsString("Valor inválido")));
    }

    @Test
    @DisplayName("POST /api/emprendimientos con campos inválidos debe responder 400 con mapa de errores")
    void testValidacionCamposDevuelve400() throws Exception {
        String jsonConCamposInvalidos = """
                {
                    "nombre": "",
                    "categoria": "COMIDA",
                    "disponible": true,
                    "precioDesde": -10.0,
                    "whatsapp": "123"
                }
                """;

        mockMvc.perform(post("/api/emprendimientos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonConCamposInvalidos))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.errors.nombre").exists())
                .andExpect(jsonPath("$.errors.precioDesde").exists())
                .andExpect(jsonPath("$.errors.whatsapp").exists());
    }
}
