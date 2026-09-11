CREATE TABLE `jugador`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `alias` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(50) NOT NULL,
    `fecha_registro` DATE NOT NULL DEFAULT (CURRENT_DATE)
);
ALTER TABLE `jugador` ADD UNIQUE `jugador_alias_unique`(`alias`);
ALTER TABLE `jugador` ADD UNIQUE `jugador_correo_unique`(`correo`);

CREATE TABLE `videojuego`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `genero` VARCHAR(20) NOT NULL
);
ALTER TABLE `videojuego` ADD UNIQUE `videojuego_nombre_unique`(`nombre`);

CREATE TABLE `puntuacion`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_jugador` INT UNSIGNED NOT NULL,   
    `id_videojuego` INT UNSIGNED NOT NULL, 
    `puntuacion` INT NOT NULL,
    `fecha` DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT `chk_puntuacion_no_negativa` CHECK (`puntuacion` >= 0)
);
ALTER TABLE `puntuacion` ADD CONSTRAINT `puntuacion_id_videojuego_foreign` FOREIGN KEY(`id_videojuego`) REFERENCES `videojuego`(`id`);
ALTER TABLE `puntuacion` ADD CONSTRAINT `puntuacion_id_jugador_foreign` FOREIGN KEY(`id_jugador`) REFERENCES `jugador`(`id`);