
-- ============================================================
-- PROCEDURES: GÉNERO
-- ============================================================
DELIMITER $$
 
-- CREATE (Registrar género de videojuegos en minúsculas)
DROP PROCEDURE IF EXISTS `sp_registrar_genero`$$
CREATE PROCEDURE `sp_registrar_genero`(
    IN p_nombre VARCHAR(50)
)
BEGIN
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El nombre del género es obligatorio.';
    END IF;
 
    SET p_nombre = LOWER(TRIM(p_nombre));
 
    IF EXISTS (SELECT 1 FROM `genero` WHERE `nombre` = p_nombre) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El género especificado ya existe.';
    END IF;
 
    INSERT INTO `genero` (`nombre`) VALUES (p_nombre);
 
    SELECT
        LAST_INSERT_ID() AS `id_registrado`,
        'Género registrado exitosamente.' AS `mensaje`;
END$$
 
-- READ (Consultar géneros)
DROP PROCEDURE IF EXISTS `sp_consultar_generos`$$
CREATE PROCEDURE `sp_consultar_generos`()
BEGIN
    SELECT
        `id` AS `ID`,
        `nombre` AS `GENERO`
    FROM `genero`
    ORDER BY `nombre` ASC;
END$$
 
-- UPDATE (Modificar género)
DROP PROCEDURE IF EXISTS `sp_modificar_genero`$$
CREATE PROCEDURE `sp_modificar_genero`(
    IN p_id INT UNSIGNED,
    IN p_nuevo_nombre VARCHAR(50)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `genero` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El género especificado no existe.';
    END IF;
 
    IF p_nuevo_nombre IS NULL OR TRIM(p_nuevo_nombre) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El nuevo nombre del género no puede estar vacío.';
    END IF;
 
    SET p_nuevo_nombre = LOWER(TRIM(p_nuevo_nombre));
 
    IF EXISTS (SELECT 1 FROM `genero` WHERE `nombre` = p_nuevo_nombre AND `id` <> p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Ya existe otro género con ese nombre.';
    END IF;
 
    UPDATE `genero`
    SET `nombre` = p_nuevo_nombre
    WHERE `id` = p_id;
 
    SELECT 'Género actualizado exitosamente.' AS `mensaje`;
END$$
 
-- DELETE (Eliminar género)
DROP PROCEDURE IF EXISTS `sp_eliminar_genero`$$
CREATE PROCEDURE `sp_eliminar_genero`(
    IN p_id INT UNSIGNED
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `genero` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El género especificado no existe.';
    END IF;
 
    DELETE FROM `genero` WHERE `id` = p_id;
 
    SELECT 'Género eliminado exitosamente (los videojuegos asociados conservan su registro con id_genero = NULL).' AS `mensaje`;
END$$
 
DELIMITER ;
 
 
-- ============================================================
-- PROCEDURES: VIDEOJUEGO
-- ============================================================
DELIMITER $$
 
-- CREATE
DROP PROCEDURE IF EXISTS `sp_registrar_videojuego`$$
CREATE PROCEDURE `sp_registrar_videojuego`(
    IN p_nombre VARCHAR(100),
    IN p_id_genero INT UNSIGNED
)
BEGIN
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF02: El nombre del videojuego es obligatorio.';
    END IF;
 
    IF p_id_genero IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `genero` WHERE `id` = p_id_genero) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF02: El ID de género proporcionado no existe.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `videojuego` WHERE LOWER(`nombre`) = LOWER(TRIM(p_nombre))) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF02: Ya existe un videojuego registrado con ese nombre.';
    END IF;
 
    INSERT INTO `videojuego` (`nombre`, `id_genero`)
    VALUES (TRIM(p_nombre), p_id_genero);
 
    SELECT
        LAST_INSERT_ID() AS `id_registrado`,
        'Videojuego registrado exitosamente.' AS `mensaje`;
END$$
 
-- READ (Consultar videojuegos con su género)
DROP PROCEDURE IF EXISTS `sp_consultar_videojuegos`$$
CREATE PROCEDURE `sp_consultar_videojuegos`()
BEGIN
    SELECT
        v.`id` AS `ID`,
        v.`nombre` AS `VIDEOJUEGO`,
        COALESCE(g.`nombre`, 'sin género') AS `GENERO`
    FROM `videojuego` v
    LEFT JOIN `genero` g ON v.`id_genero` = g.`id`
    ORDER BY v.`nombre` ASC;
END$$
 
-- UPDATE
DROP PROCEDURE IF EXISTS `sp_modificar_videojuego`$$
CREATE PROCEDURE `sp_modificar_videojuego`(
    IN p_id INT UNSIGNED,
    IN p_nuevo_nombre VARCHAR(100),
    IN p_nuevo_id_genero INT UNSIGNED
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `videojuego` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El videojuego especificado no existe.';
    END IF;
 
    IF p_nuevo_nombre IS NULL OR TRIM(p_nuevo_nombre) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El nombre del videojuego es obligatorio.';
    END IF;
 
    IF p_nuevo_id_genero IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `genero` WHERE `id` = p_nuevo_id_genero) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El ID de género proporcionado no existe.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `videojuego` WHERE LOWER(`nombre`) = LOWER(TRIM(p_nuevo_nombre)) AND `id` <> p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Ya existe otro videojuego con ese nombre.';
    END IF;
 
    UPDATE `videojuego`
    SET `nombre` = TRIM(p_nuevo_nombre),
        `id_genero` = p_nuevo_id_genero
    WHERE `id` = p_id;
 
    SELECT 'Videojuego actualizado exitosamente.' AS `mensaje`;
END$$
 
-- DELETE
DROP PROCEDURE IF EXISTS `sp_eliminar_videojuego`$$
CREATE PROCEDURE `sp_eliminar_videojuego`(
    IN p_id INT UNSIGNED
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `videojuego` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El videojuego especificado no existe.';
    END IF;
 
    DELETE FROM `puntuacion` WHERE `id_videojuego` = p_id;
    DELETE FROM `videojuego` WHERE `id` = p_id;
 
    SELECT 'Videojuego y sus puntuaciones asociadas eliminados exitosamente.' AS `mensaje`;
END$$
 
DELIMITER ;
 
 
-- ============================================================
-- PROCEDURES: JUGADOR
-- ============================================================
DELIMITER $$
 
-- CREATE (Registrar jugador)
DROP PROCEDURE IF EXISTS `sp_registrar_jugador`$$
CREATE PROCEDURE `sp_registrar_jugador`(
    IN p_nombre VARCHAR(100),
    IN p_alias VARCHAR(100),
    IN p_correo VARCHAR(50)
)
BEGIN
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' OR
       p_alias IS NULL OR TRIM(p_alias) = '' OR
       p_correo IS NULL OR TRIM(p_correo) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Nombre, Gamertag (Alias) y Correo son obligatorios.';
    END IF;
 
    IF p_correo NOT LIKE '%_@_%.__%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El formato del correo electrónico no es válido.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `alias` = TRIM(p_alias)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Gamertag (Alias) ya está en uso.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `correo` = TRIM(p_correo)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Correo electrónico ya está registrado.';
    END IF;
 
    INSERT INTO `jugador` (`nombre`, `alias`, `correo`)
    VALUES (TRIM(p_nombre), TRIM(p_alias), TRIM(p_correo));
 
    SELECT
        LAST_INSERT_ID() AS `id_registrado`,
        'Jugador registrado exitosamente.' AS `mensaje`;
END$$
 
-- READ (Consultar jugadores)
DROP PROCEDURE IF EXISTS `sp_consultar_jugadores`$$
CREATE PROCEDURE `sp_consultar_jugadores`()
BEGIN
    SELECT
        `id` AS `ID`,
        `nombre` AS `NOMBRE`,
        `alias` AS `GAMERTAG`,
        `correo` AS `CORREO`,
        `fecha_registro` AS `FECHA_REGISTRO`
    FROM `jugador`
    ORDER BY `nombre` ASC;
END$$
 
-- UPDATE (Modificar datos de un jugador)
DROP PROCEDURE IF EXISTS `sp_modificar_jugador`$$
CREATE PROCEDURE `sp_modificar_jugador`(
    IN p_id INT UNSIGNED,
    IN p_nombre VARCHAR(100),
    IN p_alias VARCHAR(100),
    IN p_correo VARCHAR(50)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `jugador` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El jugador especificado no existe.';
    END IF;
 
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' OR
       p_alias IS NULL OR TRIM(p_alias) = '' OR
       p_correo IS NULL OR TRIM(p_correo) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Nombre, Gamertag (Alias) y Correo son obligatorios.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `alias` = TRIM(p_alias) AND `id` <> p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Gamertag (Alias) ya pertenece a otro jugador.';
    END IF;
 
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `correo` = TRIM(p_correo) AND `id` <> p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El Correo electrónico ya pertenece a otro jugador.';
    END IF;
 
    UPDATE `jugador`
    SET `nombre` = TRIM(p_nombre),
        `alias` = TRIM(p_alias),
        `correo` = TRIM(p_correo)
    WHERE `id` = p_id;
 
    SELECT 'Jugador actualizado exitosamente.' AS `mensaje`;
END$$
 
-- DELETE (Eliminar jugador)
DROP PROCEDURE IF EXISTS `sp_eliminar_jugador`$$
CREATE PROCEDURE `sp_eliminar_jugador`(
    IN p_id INT UNSIGNED
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `jugador` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El jugador especificado no existe.';
    END IF;
 
    DELETE FROM `puntuacion` WHERE `id_jugador` = p_id;
    DELETE FROM `jugador` WHERE `id` = p_id;
 
    SELECT 'Jugador y sus puntuaciones asociadas eliminados exitosamente.' AS `mensaje`;
END$$
 
DELIMITER ;
 
 
-- ============================================================
-- PROCEDURES: PUNTUACIÓN
-- ============================================================
DELIMITER $$
 
-- CREATE (Registrar puntuación)
DROP PROCEDURE IF EXISTS `sp_registrar_puntuacion`$$
CREATE PROCEDURE `sp_registrar_puntuacion`(
    IN p_id_jugador INT UNSIGNED,
    IN p_id_videojuego INT UNSIGNED,
    IN p_puntuacion INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `jugador` WHERE `id` = p_id_jugador) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El jugador especificado no existe.';
    END IF;
 
    IF NOT EXISTS (SELECT 1 FROM `videojuego` WHERE `id` = p_id_videojuego) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El videojuego especificado no existe.';
    END IF;
 
    IF p_puntuacion IS NULL OR p_puntuacion < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La puntuación no puede ser negativa ni nula.';
    END IF;
 
    INSERT INTO `puntuacion` (`id_jugador`, `id_videojuego`, `puntuacion`)
    VALUES (p_id_jugador, p_id_videojuego, p_puntuacion);
 
    SELECT
        LAST_INSERT_ID() AS `id_registrado`,
        'Puntuación registrada exitosamente.' AS `mensaje`;
END$$
 
-- READ (Consultar puntuaciones con nombres de jugador y videojuego)
DROP PROCEDURE IF EXISTS `sp_consultar_puntuaciones`$$
CREATE PROCEDURE `sp_consultar_puntuaciones`()
BEGIN
    SELECT
        p.`id` AS `ID`,
        j.`nombre` AS `JUGADOR`,
        j.`alias` AS `GAMERTAG`,
        v.`nombre` AS `VIDEOJUEGO`,
        p.`puntuacion` AS `PUNTUACION`,
        p.`fecha` AS `FECHA`
    FROM `puntuacion` p
    INNER JOIN `jugador` j ON p.`id_jugador` = j.`id`
    INNER JOIN `videojuego` v ON p.`id_videojuego` = v.`id`
    ORDER BY p.`fecha` DESC, p.`puntuacion` DESC;
END$$
 
-- UPDATE (Modificar puntuación)
DROP PROCEDURE IF EXISTS `sp_modificar_puntuacion`$$
CREATE PROCEDURE `sp_modificar_puntuacion`(
    IN p_id INT UNSIGNED,
    IN p_nueva_puntuacion INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `puntuacion` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El registro de puntuación especificado no existe.';
    END IF;
 
    IF p_nueva_puntuacion IS NULL OR p_nueva_puntuacion < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La puntuación no puede ser negativa.';
    END IF;
 
    UPDATE `puntuacion`
    SET `puntuacion` = p_nueva_puntuacion
    WHERE `id` = p_id;
 
    SELECT 'Puntuación actualizada exitosamente.' AS `mensaje`;
END$$
 
-- DELETE (Eliminar puntuación)
DROP PROCEDURE IF EXISTS `sp_eliminar_puntuacion`$$
CREATE PROCEDURE `sp_eliminar_puntuacion`(
    IN p_id INT UNSIGNED
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM `puntuacion` WHERE `id` = p_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El registro de puntuación especificado no existe.';
    END IF;
 
    DELETE FROM `puntuacion` WHERE `id` = p_id;
 
    SELECT 'Registro de puntuación eliminado exitosamente.' AS `mensaje`;
END$$
 
DELIMITER ;
 
 
-- ============================================================
-- PROCEDURES: ESTADÍSTICAS
-- ============================================================
DELIMITER $$
 
DROP PROCEDURE IF EXISTS `sp_obtener_estadisticas`$$
CREATE PROCEDURE `sp_obtener_estadisticas`()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM `jugador`) AS `total_jugadores`,
        (SELECT COUNT(*) FROM `genero`) AS `total_generos`,
        (SELECT COUNT(*) FROM `videojuego`) AS `total_videojuegos`,
        (SELECT COUNT(*) FROM `puntuacion`) AS `total_puntuaciones`,
        COALESCE(ROUND((SELECT AVG(`puntuacion`) FROM `puntuacion`), 2), 0.00) AS `puntuacion_promedio`;
END$$
 
DELIMITER ;