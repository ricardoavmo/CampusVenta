package pe.edu.utp.campusventa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "codigo")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo electrónico no válido")
    @Pattern(regexp = "(?i)^[a-zA-Z0-9._%+-]+@utp\\.edu\\.pe$", message = "El correo debe pertenecer obligatoriamente al dominio institucional @utp.edu.pe")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "El código de estudiante es obligatorio")
    @Pattern(regexp = "(?i)^U[0-9]{8}$", message = "El código debe iniciar con 'U' seguido de 8 dígitos numéricos (ej: U20210045)")
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @NotBlank(message = "La contraseña es obligatoria")
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Rol rol = Rol.COMPRADOR;

    @Column(length = 100)
    private String carrera;

    @Column(length = 50)
    private String ciclo;

    @Column(length = 15)
    private String telefono;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 500)
    private String bio;

    @Column(name = "redes_sociales_json", columnDefinition = "TEXT")
    private String redesSocialesJson;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @OneToMany(mappedBy = "propietario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("usuario-emprendimientos")
    @Builder.Default
    private List<Emprendimiento> emprendimientos = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("usuario-resena")
    @Builder.Default
    private List<Resena> resenas = new ArrayList<>();
}
