package pe.edu.utp.campusventa.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.edu.utp.campusventa.model.*;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;
import pe.edu.utp.campusventa.repository.ProductoRepository;
import pe.edu.utp.campusventa.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            UsuarioRepository usuarioRepo,
            EmprendimientoRepository empRepo,
            ProductoRepository prodRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Asegurar usuario admin demo si no existe
            if (!usuarioRepo.existsByEmailIgnoreCase("admin@utp.edu.pe") && !usuarioRepo.existsByCodigoIgnoreCase("U20210001")) {
                usuarioRepo.save(Usuario.builder()
                        .nombre("Administrador CampusVenta")
                        .email("admin@utp.edu.pe")
                        .codigo("U20210001")
                        .password(passwordEncoder.encode("Admin2026!"))
                        .rol(Rol.ADMIN)
                        .activo(true)
                        .build());
            }

            // 2. Obtener o crear usuario vendedor para asociar a los emprendimientos
            Usuario vendedor = usuarioRepo.findAll().stream()
                    .filter(u -> u.getRol() == Rol.VENDEDOR)
                    .findFirst()
                    .orElseGet(() -> {
                        if (!usuarioRepo.existsByEmailIgnoreCase("vendedor@utp.edu.pe") && !usuarioRepo.existsByCodigoIgnoreCase("U23247002")) {
                            return usuarioRepo.save(Usuario.builder()
                                    .nombre("Angel Ancajima")
                                    .email("vendedor@utp.edu.pe")
                                    .codigo("U23247002")
                                    .password(passwordEncoder.encode("Password123!"))
                                    .rol(Rol.VENDEDOR)
                                    .carrera("Ingeniería de Sistemas")
                                    .ciclo("VII")
                                    .telefono("987654321")
                                    .activo(true)
                                    .build());
                        }
                        List<Usuario> todos = usuarioRepo.findAll();
                        return todos.isEmpty() ? null : todos.get(0);
                    });

            // 3. Crear usuario comprador demo si no existe
            if (!usuarioRepo.existsByEmailIgnoreCase("comprador@utp.edu.pe") && !usuarioRepo.existsByCodigoIgnoreCase("U23247099")) {
                usuarioRepo.save(Usuario.builder()
                        .nombre("Estudiante Comprador")
                        .email("comprador@utp.edu.pe")
                        .codigo("U23247099")
                        .password(passwordEncoder.encode("Password123!"))
                        .rol(Rol.COMPRADOR)
                        .carrera("Ingeniería de Sistemas")
                        .ciclo("VII")
                        .telefono("912345678")
                        .activo(true)
                        .build());
            }

            // 4. Poblar catálogo de prueba si la base de datos no tiene emprendimientos
            if (empRepo.count() == 0) {
                // Tienda 1: Snacks & Bebidas UTP
                Emprendimiento tienda1 = Emprendimiento.builder()
                        .nombre("Snacks & Bebidas UTP")
                        .descripcion("Snacks, sándwiches, jugos naturales y café al paso para recesos.")
                        .categoria(Categoria.COMIDA)
                        .torre("Torre A")
                        .piso("Piso 1")
                        .precioDesde(BigDecimal.valueOf(3.50))
                        .whatsapp("987654321")
                        .vendedorNombre("Angel Ancajima")
                        .carreraCiclo("Ing. Sistemas - VII")
                        .calificacion(4.8)
                        .totalResenas(15)
                        .tiempoEntrega("5 - 10 min")
                        .horarioAtencion("08:00 - 18:00")
                        .disponible(true)
                        .activo(true)
                        .propietario(vendedor)
                        .build();
                tienda1 = empRepo.save(tienda1);

                Producto p1 = Producto.builder()
                        .nombre("Sándwich Mixto")
                        .descripcion("Jamón y queso derretido en pan artesanal caliente")
                        .precio(BigDecimal.valueOf(4.50))
                        .disponible(true)
                        .stock(15)
                        .badge("Popular")
                        .emprendimiento(tienda1)
                        .build();

                Producto p2 = Producto.builder()
                        .nombre("Jugo Natural 500ml")
                        .descripcion("Jugo fresco de naranja, papaya o fresa al instante")
                        .precio(BigDecimal.valueOf(5.00))
                        .disponible(true)
                        .stock(20)
                        .badge("Fresco")
                        .emprendimiento(tienda1)
                        .build();

                Producto p3 = Producto.builder()
                        .nombre("Café Americano")
                        .descripcion("Café pasado con granos selectos de Chanchamayo")
                        .precio(BigDecimal.valueOf(3.50))
                        .disponible(true)
                        .stock(25)
                        .badge(null)
                        .emprendimiento(tienda1)
                        .build();

                prodRepo.saveAll(List.of(p1, p2, p3));

                // Tienda 2: Chifles & Bocaditos Piuranos
                Emprendimiento tienda2 = Emprendimiento.builder()
                        .nombre("Chifles & Bocaditos Piuranos")
                        .descripcion("Chifles artesanales piuranos con cecina crocante y bocaditos norteños.")
                        .categoria(Categoria.COMIDA)
                        .torre("Torre B")
                        .piso("Piso 2")
                        .precioDesde(BigDecimal.valueOf(3.00))
                        .whatsapp("987654322")
                        .vendedorNombre("Paola Mijahuanga")
                        .carreraCiclo("Administración - VIII")
                        .calificacion(4.9)
                        .totalResenas(28)
                        .tiempoEntrega("Inmediato")
                        .horarioAtencion("09:00 - 17:00")
                        .disponible(true)
                        .activo(true)
                        .propietario(vendedor)
                        .build();
                tienda2 = empRepo.save(tienda2);

                Producto p4 = Producto.builder()
                        .nombre("Chifles Clásicos Salados 100g")
                        .descripcion("Plátano verde finamente laminado con sal marina")
                        .precio(BigDecimal.valueOf(3.00))
                        .disponible(true)
                        .stock(30)
                        .badge("Típico")
                        .emprendimiento(tienda2)
                        .build();

                Producto p5 = Producto.builder()
                        .nombre("Chifles Mixtos con Cecina")
                        .descripcion("Bolsa de 150g con cecina frita norteña")
                        .precio(BigDecimal.valueOf(6.00))
                        .disponible(true)
                        .stock(18)
                        .badge("Favorito")
                        .emprendimiento(tienda2)
                        .build();

                prodRepo.saveAll(List.of(p4, p5));

                // Tienda 3: Postres & Dulces UTP
                Emprendimiento tienda3 = Emprendimiento.builder()
                        .nombre("Postres & Dulces UTP")
                        .descripcion("Brownies melcochudos, alfajores de maicena y tortas caseras en porciones.")
                        .categoria(Categoria.POSTRES)
                        .torre("Torre A")
                        .piso("Piso 3")
                        .precioDesde(BigDecimal.valueOf(4.00))
                        .whatsapp("987654323")
                        .vendedorNombre("Toom Vilela")
                        .carreraCiclo("Ing. Industrial - VI")
                        .calificacion(4.7)
                        .totalResenas(20)
                        .tiempoEntrega("5 min")
                        .horarioAtencion("10:00 - 19:00")
                        .disponible(true)
                        .activo(true)
                        .propietario(vendedor)
                        .build();
                tienda3 = empRepo.save(tienda3);

                Producto p6 = Producto.builder()
                        .nombre("Brownie Fudge de Chocolate")
                        .descripcion("Crocante por fuera y centro húmedo de chocolate")
                        .precio(BigDecimal.valueOf(4.00))
                        .disponible(true)
                        .stock(16)
                        .badge("Top Ventas")
                        .emprendimiento(tienda3)
                        .build();

                Producto p7 = Producto.builder()
                        .nombre("Alfajores de Maicena (Pack x4)")
                        .descripcion("Rellenos con manjar blanco casero y coco rallado")
                        .precio(BigDecimal.valueOf(5.00))
                        .disponible(true)
                        .stock(12)
                        .badge(null)
                        .emprendimiento(tienda3)
                        .build();

                prodRepo.saveAll(List.of(p6, p7));

                // Tienda 4: TecnoAccesorios & Papelería
                Emprendimiento tienda4 = Emprendimiento.builder()
                        .nombre("TecnoAccesorios & Papelería UTP")
                        .descripcion("Cables USB-C, protectores, resaltadores, cuadernos universitarios y cargadores.")
                        .categoria(Categoria.ACCESORIOS)
                        .torre("Biblioteca")
                        .piso("Piso 1")
                        .precioDesde(BigDecimal.valueOf(8.00))
                        .whatsapp("987654324")
                        .vendedorNombre("Kelvin Cienfuegos")
                        .carreraCiclo("Ing. Sistemas - VII")
                        .calificacion(4.6)
                        .totalResenas(11)
                        .tiempoEntrega("Inmediato")
                        .horarioAtencion("08:30 - 20:00")
                        .disponible(true)
                        .activo(true)
                        .propietario(vendedor)
                        .build();
                tienda4 = empRepo.save(tienda4);

                Producto p8 = Producto.builder()
                        .nombre("Cable USB Tipo C 1m")
                        .descripcion("Cable reforzado de carga rápida para celulares y tablets")
                        .precio(BigDecimal.valueOf(12.00))
                        .disponible(true)
                        .stock(14)
                        .badge("Oferta")
                        .emprendimiento(tienda4)
                        .build();

                Producto p9 = Producto.builder()
                        .nombre("Set de Resaltadores Pastel (x4)")
                        .descripcion("Colores suaves que no traspasan las páginas")
                        .precio(BigDecimal.valueOf(8.00))
                        .disponible(true)
                        .stock(20)
                        .badge(null)
                        .emprendimiento(tienda4)
                        .build();

                prodRepo.saveAll(List.of(p8, p9));
            }
        };
    }
}
