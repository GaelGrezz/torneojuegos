CREATE TABLE jugador(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    alias VARCHAR(100) NOT NULL,
    correo VARCHAR(50) NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE)
);
ALTER TABLE jugador ADD UNIQUE jugador_alias_unique(alias);
ALTER TABLE jugador ADD UNIQUE jugador_correo_unique(correo);

-- 1. Tabla Género (Catálogo independiente)
CREATE TABLE genero(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);
ALTER TABLE genero ADD UNIQUE genero_nombre_unique(nombre);

-- 2. Tabla Videojuego (Apunta a genero, id_genero puede ser NULL)
CREATE TABLE videojuego(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_genero INT UNSIGNED NULL
);
ALTER TABLE videojuego ADD UNIQUE videojuego_nombre_unique(nombre);
ALTER TABLE videojuego ADD CONSTRAINT videojuego_id_genero_foreign 
    FOREIGN KEY (id_genero) REFERENCES genero(id) ON DELETE SET NULL;

-- 3. Tabla Puntuación
CREATE TABLE puntuacion(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_jugador INT UNSIGNED NOT NULL,   
    id_videojuego INT UNSIGNED NOT NULL, 
    puntuacion INT NOT NULL,
    fecha DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT chk_puntuacion_no_negativa CHECK (puntuacion >= 0)
);
ALTER TABLE puntuacion ADD CONSTRAINT puntuacion_id_videojuego_foreign FOREIGN KEY(id_videojuego) REFERENCES videojuego(id);
ALTER TABLE puntuacion ADD CONSTRAINT puntuacion_id_jugador_foreign FOREIGN KEY(id_jugador) REFERENCES jugador(id);
