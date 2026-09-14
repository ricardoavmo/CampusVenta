package pe.edu.utp.campusventa.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.campusventa.model.Categoria;
import pe.edu.utp.campusventa.model.Emprendimiento;
import pe.edu.utp.campusventa.model.Producto;
import pe.edu.utp.campusventa.model.Resena;
import pe.edu.utp.campusventa.repository.EmprendimientoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmprendimientoRepository repository;

    public DataInitializer(EmprendimientoRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Si no hay productos poblados o faltan reseñas en las tiendas, refrescamos con el catálogo completo
        boolean necesitaCarga = repository.count() == 0 || repository.findAll().stream().anyMatch(e -> 
            e.getProductos().isEmpty() || e.getResenas().isEmpty()
        );

        if (necesitaCarga) {
            repository.deleteAll();

            List<Emprendimiento> tiendas = new ArrayList<>();

            // 1. Chocobombas & Brownies UTP (Andrea Castillo)
            Emprendimiento e1 = Emprendimiento.builder()
                    .nombre("Chocobombas & Brownies UTP")
                    .categoria(Categoria.POSTRES)
                    .disponible(true)
                    .torre("Torre A (10 pisos)")
                    .piso("Piso 3")
                    .descripcion("Brownies húmedos recién horneados todas las mañanas y chocobombas de chocolate cusqueño rellenas de malvaviscos. Entregas directas en carpetas, aulas y zonas de estudio de Torre A.")
                    .precioDesde(new BigDecimal("4.50"))
                    .whatsapp("51969123456")
                    .vendedorNombre("Andrea Castillo")
                    .carreraCiclo("6to ciclo Psicología")
                    .calificacion(5.0)
                    .totalResenas(3)
                    .tiempoEntrega("~4 min")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e1.addProducto(Producto.builder()
                    .nombre("Brownie Fudge Extra Choc")
                    .descripcion("Brownie tibio con centro húmedo de fudge artesanal y chispas de chocolate belga al 60%.")
                    .precio(new BigDecimal("5.00"))
                    .disponible(true)
                    .badge("Más vendido")
                    .stock(6)
                    .imagenUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80")
                    .build());

            e1.addProducto(Producto.builder()
                    .nombre("Chocobomba Marshmallow Caliente")
                    .descripcion("Esfera de chocolate real rellena de cocoa y malvaviscos. Incluye vaso térmico y leche caliente servida al paso.")
                    .precio(new BigDecimal("6.50"))
                    .disponible(true)
                    .badge("Preparado al momento")
                    .stock(4)
                    .imagenUrl("https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80")
                    .build());

            e1.addProducto(Producto.builder()
                    .nombre("Cookie Brownie Brookie")
                    .descripcion("Mitad galleta con chispas de chocolate horneada sobre base de brownie fudge. Suave y crocante.")
                    .precio(new BigDecimal("4.50"))
                    .disponible(true)
                    .badge("Nuevo")
                    .stock(8)
                    .imagenUrl("https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80")
                    .build());

            e1.addResena(Resena.builder()
                    .estudianteNombre("Valeria Silva")
                    .carreraCiclo("4to ciclo Ing. Industrial")
                    .calificacion(5)
                    .comentario("Los mejores brownies de Torre A. Me los llevaron calientitos al aula 304 antes de mi práctica de física. 10/10.")
                    .fechaCreacion(LocalDateTime.now().minusHours(2))
                    .verificado(true)
                    .build());

            e1.addResena(Resena.builder()
                    .estudianteNombre("Mateo Córdova")
                    .carreraCiclo("2do ciclo Derecho")
                    .calificacion(5)
                    .comentario("La chocobomba con leche caliente te revive en los días de parciales. Súper recomendado.")
                    .fechaCreacion(LocalDateTime.now().minusHours(5))
                    .verificado(true)
                    .build());

            e1.addResena(Resena.builder()
                    .estudianteNombre("Camila Ruiz")
                    .carreraCiclo("6to ciclo Psicología")
                    .calificacion(5)
                    .comentario("Siempre puntuales y con vuelto exacto. El fudge es de primera calidad artesanal.")
                    .fechaCreacion(LocalDateTime.now().minusDays(1))
                    .verificado(true)
                    .build());

            tiendas.add(e1);

            // 2. Bajón Express FIME (Carlos Mendoza)
            Emprendimiento e2 = Emprendimiento.builder()
                    .nombre("Bajón Express FIME")
                    .categoria(Categoria.COMIDA)
                    .disponible(true)
                    .torre("Torre B (7 pisos)")
                    .piso("Piso 1")
                    .descripcion("Pancitos calientes, sándwiches triples generosos y empanadas horneadas con el auténtico sabor norteño para salvarte antes de entrar a clase.")
                    .precioDesde(new BigDecimal("3.50"))
                    .whatsapp("51978234567")
                    .vendedorNombre("Carlos Mendoza")
                    .carreraCiclo("8vo ciclo Ing. Mecánica")
                    .calificacion(4.8)
                    .totalResenas(2)
                    .tiempoEntrega("~3 min")
                    .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e2.addProducto(Producto.builder()
                    .nombre("Sandwich de Pollo Deshilachado + Chicha")
                    .descripcion("Pancito crocante con abundante pollo, apio y mayonesa + vasito de chicha morada piurana bien helada.")
                    .precio(new BigDecimal("6.00"))
                    .disponible(true)
                    .badge("Combo Top")
                    .stock(5)
                    .imagenUrl("https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80")
                    .build());

            e2.addProducto(Producto.builder()
                    .nombre("Empanada Piurana de Carne al Horno")
                    .descripcion("Masa suave dorada rellena de carne picada, aceituna, huevo duro y toque de limón sutil.")
                    .precio(new BigDecimal("3.50"))
                    .disponible(true)
                    .badge("Horneado hoy")
                    .stock(10)
                    .imagenUrl("https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=80")
                    .build());

            e2.addResena(Resena.builder()
                    .estudianteNombre("Sebastián Alburqueque")
                    .carreraCiclo("5to ciclo Ing. Mecánica")
                    .calificacion(5)
                    .comentario("El sándwich con chicha morada es un clásico en Torre B. Resuelve el almuerzo en 3 minutos.")
                    .fechaCreacion(LocalDateTime.now().minusHours(3))
                    .verificado(true)
                    .build());

            e2.addResena(Resena.builder()
                    .estudianteNombre("Diego Farfán")
                    .carreraCiclo("3er ciclo Arquitectura")
                    .calificacion(5)
                    .comentario("Las empanadas salen crocantes y bien calientes. La masa es muy buena.")
                    .fechaCreacion(LocalDateTime.now().minusDays(1))
                    .verificado(true)
                    .build());

            tiendas.add(e2);

            // 3. Pixel UTP Merch & Stickers (Luciana Flores)
            Emprendimiento e3 = Emprendimiento.builder()
                    .nombre("Pixel UTP Merch & Stickers")
                    .categoria(Categoria.ACCESORIOS)
                    .disponible(true)
                    .torre("Biblioteca")
                    .piso("Nivel 1")
                    .descripcion("Stickers vinílicos premium resistentes al agua y termo, lanyards institucionales y llaveros acrílicos diseñados para la comunidad UTP Piura.")
                    .precioDesde(new BigDecimal("2.00"))
                    .whatsapp("51987345678")
                    .vendedorNombre("Luciana Flores")
                    .carreraCiclo("5to ciclo Diseño Digital")
                    .calificacion(5.0)
                    .totalResenas(2)
                    .tiempoEntrega("~5 min")
                    .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e3.addProducto(Producto.builder()
                    .nombre("Pack 5 Stickers Dev & Anime Vinil")
                    .descripcion("Stickers laminados mate resistentes a caídas y agua para personalizar tu laptop o termo.")
                    .precio(new BigDecimal("5.00"))
                    .disponible(true)
                    .badge("Top 1")
                    .stock(15)
                    .imagenUrl("https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&auto=format&fit=crop&q=80")
                    .build());

            e3.addProducto(Producto.builder()
                    .nombre("Lanyard Oficial UTP Piura")
                    .descripcion("Cinta gruesa satinada con broche metálico reforzado para tu carné universitario.")
                    .precio(new BigDecimal("8.00"))
                    .disponible(true)
                    .badge("Edición Campus")
                    .stock(12)
                    .imagenUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80")
                    .build());

            e3.addResena(Resena.builder()
                    .estudianteNombre("Fiorella Montero")
                    .carreraCiclo("4to ciclo Diseño Digital")
                    .calificacion(5)
                    .comentario("Los stickers no se despegan con el agua en mi termo. El lanyard con diseño UTP Piura está impecable.")
                    .fechaCreacion(LocalDateTime.now().minusHours(1))
                    .verificado(true)
                    .build());

            e3.addResena(Resena.builder()
                    .estudianteNombre("Renzo Seminario")
                    .carreraCiclo("7mo ciclo Ing. Sistemas")
                    .calificacion(5)
                    .comentario("Me los entregó en los módulos de biblioteca mientras repasaba. Excelente atención.")
                    .fechaCreacion(LocalDateTime.now().minusHours(6))
                    .verificado(true)
                    .build());

            tiendas.add(e3);

            // 4. Tutorías Pro: Cálculo y Física (Jorge Ramos)
            Emprendimiento e4 = Emprendimiento.builder()
                    .nombre("Tutorías Pro: Cálculo y Física")
                    .categoria(Categoria.SERVICIOS)
                    .disponible(false)
                    .torre("Torre A (10 pisos)")
                    .piso("Piso 4")
                    .descripcion("Asesoría personalizada y resolución guiada de exámenes pasados para Cálculo I, II y Física. Sesiones 1 a 1 en mesas de estudio o biblioteca.")
                    .precioDesde(new BigDecimal("15.00"))
                    .whatsapp("51996456789")
                    .vendedorNombre("Jorge Ramos")
                    .carreraCiclo("9no ciclo Ing. Civil")
                    .calificacion(5.0)
                    .totalResenas(2)
                    .tiempoEntrega("Bajo reserva")
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e4.addProducto(Producto.builder()
                    .nombre("Sesión 1 a 1: Resolución Examen Parcial")
                    .descripcion("60 minutos intensivos resolviendo ejercicios tipo de exámenes pasados con trucos y teoría clave.")
                    .precio(new BigDecimal("15.00"))
                    .disponible(true)
                    .badge("100% Aprobados")
                    .stock(3)
                    .imagenUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80")
                    .build());

            e4.addResena(Resena.builder()
                    .estudianteNombre("Kevin Navarro")
                    .carreraCiclo("3er ciclo Ing. Civil")
                    .calificacion(5)
                    .comentario("Me salvó en Cálculo II con los trucos de derivadas e integrales. Pasé con 16.")
                    .fechaCreacion(LocalDateTime.now().minusDays(2))
                    .verificado(true)
                    .build());

            e4.addResena(Resena.builder()
                    .estudianteNombre("Lucía Vegas")
                    .carreraCiclo("2do ciclo Ing. Industrial")
                    .calificacion(5)
                    .comentario("Explica paso a paso con muchísima paciencia en los cubículos de Torre A.")
                    .fechaCreacion(LocalDateTime.now().minusDays(3))
                    .verificado(true)
                    .build());

            tiendas.add(e4);

            // 5. Dulces Tentaciones Piura (Sofía Paredes)
            Emprendimiento e5 = Emprendimiento.builder()
                    .nombre("Dulces Tentaciones Piura")
                    .categoria(Categoria.POSTRES)
                    .disponible(true)
                    .torre("Torre B (7 pisos)")
                    .piso("Piso 3")
                    .descripcion("Alfajores suaves de maicena con harto manjar blanco artesanal, vasitos de pie de limón y galletas rellenas hechas en casa.")
                    .precioDesde(new BigDecimal("3.00"))
                    .whatsapp("51955567890")
                    .vendedorNombre("Sofía Paredes")
                    .carreraCiclo("7mo ciclo Administración")
                    .calificacion(5.0)
                    .totalResenas(2)
                    .tiempoEntrega("~5 min")
                    .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e5.addProducto(Producto.builder()
                    .nombre("Alfajores Artesanales con Manjar Blanco (x3)")
                    .descripcion("Masa suavecita que se deshace en la boca con abundante manjar blanco casero y azúcar impalpable.")
                    .precio(new BigDecimal("3.50"))
                    .disponible(true)
                    .badge("Favorito")
                    .stock(10)
                    .imagenUrl("https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80")
                    .build());

            e5.addProducto(Producto.builder()
                    .nombre("Pie de Limón Piurano en Vasito")
                    .descripcion("Capas de galleta crocante, crema suave de limón sutil piurano y merengue tostado al soplete.")
                    .precio(new BigDecimal("4.50"))
                    .disponible(true)
                    .badge("Postre del día")
                    .stock(6)
                    .imagenUrl("https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&auto=format&fit=crop&q=80")
                    .build());

            e5.addResena(Resena.builder()
                    .estudianteNombre("Ana Claudia Pacherres")
                    .carreraCiclo("5to ciclo Contabilidad")
                    .calificacion(5)
                    .comentario("Los alfajores de maicena son adictivos, vienen con bastante manjar blanco casero.")
                    .fechaCreacion(LocalDateTime.now().minusHours(4))
                    .verificado(true)
                    .build());

            e5.addResena(Resena.builder()
                    .estudianteNombre("Joaquín Barreto")
                    .carreraCiclo("3er ciclo Administración")
                    .calificacion(5)
                    .comentario("El pie de limón en vasito helado cae perfecto para el calor de la tarde en Piura.")
                    .fechaCreacion(LocalDateTime.now().minusDays(1))
                    .verificado(true)
                    .build());

            tiendas.add(e5);

            // 6. Cables & Tech Piura (Renzo Díaz)
            Emprendimiento e6 = Emprendimiento.builder()
                    .nombre("Cables & Tech Piura")
                    .categoria(Categoria.ACCESORIOS)
                    .disponible(false)
                    .torre("Canchas")
                    .piso("Graderías Losas Deportivas")
                    .descripcion("Accesorios de emergencia tecnológica: cables reforzados, adaptadores HDMI para tus exposiciones y cargadores rápidos probados.")
                    .precioDesde(new BigDecimal("12.00"))
                    .whatsapp("51944678901")
                    .vendedorNombre("Renzo Díaz")
                    .carreraCiclo("9no ciclo Ing. Sistemas")
                    .calificacion(5.0)
                    .totalResenas(1)
                    .tiempoEntrega("Coordinación previa")
                    .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                    .imagenUrl("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80")
                    .productos(new ArrayList<>())
                    .resenas(new ArrayList<>())
                    .build();

            e6.addProducto(Producto.builder()
                    .nombre("Cable USB-C Carga Rápida 65W Reforzado")
                    .descripcion("Cable trenzado de 1.5 metros compatible con laptops, tablets y celulares con carga ultrarrápida.")
                    .precio(new BigDecimal("12.00"))
                    .disponible(true)
                    .badge("Garantía")
                    .stock(8)
                    .imagenUrl("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80")
                    .build());

            e6.addProducto(Producto.builder()
                    .nombre("Adaptador HDMI a USB-C para Exposiciones")
                    .descripcion("Conecta tu laptop moderna al proyector de las aulas UTP sin complicaciones de drivers.")
                    .precio(new BigDecimal("18.00"))
                    .disponible(true)
                    .badge("Esencial UTP")
                    .stock(4)
                    .imagenUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80")
                    .build());

            e6.addResena(Resena.builder()
                    .estudianteNombre("Christian Morales")
                    .carreraCiclo("8vo ciclo Ing. Sistemas")
                    .calificacion(5)
                    .comentario("Me salvó de una expo final cuando se me quedó el adaptador. Me lo entregó en 5 minutos en las canchas.")
                    .fechaCreacion(LocalDateTime.now().minusHours(2))
                    .verificado(true)
                    .build());

            tiendas.add(e6);

            repository.saveAll(tiendas);
            System.out.println(">>> [CampusVenta] Catálogo multi-producto y reseñas de estudiantes poblado exitosamente (" + tiendas.size() + " tiendas).");
        }
    }
}
