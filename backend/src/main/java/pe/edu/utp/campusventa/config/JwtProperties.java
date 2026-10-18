package pe.edu.utp.campusventa.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Propiedades tipadas para configuración de tokens JWT en CampusVenta.
 * Permite autocompletado y validación en IDEs para application.properties.
 */
@Configuration
@ConfigurationProperties(prefix = "campusventa.jwt")
@Getter
@Setter
public class JwtProperties {

    /**
     * Clave secreta HMAC para firma de tokens JWT (mínimo 256 bits).
     */
    private String secret;

    /**
     * Tiempo de expiración del token en milisegundos.
     */
    private long expirationMs = 86400000;
}
