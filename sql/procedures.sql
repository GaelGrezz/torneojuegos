DELIMITER $$
-- -----------------------------------------------------
-- RF01: Registrar jugadores
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_registrar_jugador`$$
CREATE PROCEDURE `sp_registrar_jugador`(
    IN p_nombre VARCHAR(100),
    IN p_alias VARCHAR(100),
    IN p_correo VARCHAR(50),
    IN p_fecha_registro DATE
)
BEGIN
    -- Validar obligatoriedad de campos
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' OR 
       p_alias IS NULL OR TRIM(p_alias) = '' OR 
       p_correo IS NULL OR TRIM(p_correo) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF01: El Nombre, Gamertag (Alias) y Correo son obligatorios.';
    END IF;
    -- Validar Gamertag duplicado
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `alias` = TRIM(p_alias)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF01: El Gamertag (Alias) ya se encuentra registrado.';
    END IF;
    -- Validar Correo duplicado
    IF EXISTS (SELECT 1 FROM `jugador` WHERE `correo` = TRIM(p_correo)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF01: El Correo electrónico ya se encuentra registrado.';
    END IF;
    -- Asignar fecha actual si es NULL
    IF p_fecha_registro IS NULL THEN
        SET p_fecha_registro = CURRENT_DATE;
    END IF;
    INSERT INTO `jugador` (`nombre`, `alias`, `correo`, `fecha_registro`)
    VALUES (TRIM(p_nombre), TRIM(p_alias), TRIM(p_correo), p_fecha_registro);
    SELECT 
        LAST_INSERT_ID() AS `id_registrado`, 
        'Jugador registrado exitosamente.' AS `mensaje`;
END$$
-- -----------------------------------------------------
-- RF02: Registrar videojuegos
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_registrar_videojuego`$$
CREATE PROCEDURE `sp_registrar_videojuego`(
    IN p_nombre VARCHAR(100),
    IN p_genero VARCHAR(20)
)
BEGIN
    -- Validar campos obligatorios
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' OR 
       p_genero IS NULL OR TRIM(p_genero) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF02: El Nombre y el Género del videojuego son obligatorios.';
    END IF;
    -- Validar nombre duplicado
    IF EXISTS (SELECT 1 FROM `videojuego` WHERE LOWER(`nombre`) = LOWER(TRIM(p_nombre))) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF02: Ya existe un videojuego registrado con ese nombre.';
    END IF;
    INSERT INTO `videojuego` (`nombre`, `genero`)
    VALUES (TRIM(p_nombre), TRIM(p_genero));
    SELECT 
        LAST_INSERT_ID() AS `id_registrado`, 
        'Videojuego registrado exitosamente.' AS `mensaje`;
END$$
-- -----------------------------------------------------
-- RF03 / RF05: Registrar puntuación desde la interfaz
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_registrar_puntuacion`$$
CREATE PROCEDURE `sp_registrar_puntuacion`(
    IN p_id_jugador INT UNSIGNED,
    IN p_id_videojuego INT UNSIGNED,
    IN p_puntuacion INT,
    IN p_fecha DATE
)
BEGIN
    -- Validar existencia del jugador
    IF NOT EXISTS (SELECT 1 FROM `jugador` WHERE `id` = p_id_jugador) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF03/RF05: El jugador especificado no existe.';
    END IF;
    -- Validar existencia del videojuego
    IF NOT EXISTS (SELECT 1 FROM `videojuego` WHERE `id` = p_id_videojuego) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF03/RF05: El videojuego especificado no existe.';
    END IF;
    -- Validar puntuación no negativa
    IF p_puntuacion IS NULL OR p_puntuacion < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF03/RF05: La puntuación no puede ser negativa ni nula.';
    END IF;
    -- Asignar fecha actual si es NULL
    IF p_fecha IS NULL THEN
        SET p_fecha = CURRENT_DATE;
    END IF;
    INSERT INTO `puntuacion` (`id_jugador`, `id_videojuego`, `puntuacion`, `fecha`)
    VALUES (p_id_jugador, p_id_videojuego, p_puntuacion, p_fecha);
    SELECT 
        1 AS `estatus`,
        LAST_INSERT_ID() AS `id_puntuacion`,
        'Operación correcta: Puntuación registrada exitosamente.' AS `mensaje`;
END$$
-- -----------------------------------------------------
-- RF04: Consultar jugadores
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_consultar_jugadores`$$
CREATE PROCEDURE `sp_consultar_jugadores`()
BEGIN
    SELECT 
        `alias` AS `GAMERTAG`,
        `correo` AS `CORREO`,
        DATE_FORMAT(`fecha_registro`, '%Y-%m-%d') AS `FECHA DE REGISTRO`
    FROM `jugador`
    ORDER BY `fecha_registro` DESC, `alias` ASC;
END$$
-- -----------------------------------------------------
-- RF06: Mostrar clasificación
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_mostrar_clasificacion`$$
CREATE PROCEDURE `sp_mostrar_clasificacion`(
    IN p_nombre_videojuego VARCHAR(100)
)
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.`puntuacion` DESC) AS `POSICIÓN`,
        j.`alias` AS `JUGADOR`,
        v.`nombre` AS `VIDEOJUEGO`,
        p.`puntuacion` AS `PUNTUACIÓN`,
        DATE_FORMAT(p.`fecha`, '%Y-%m-%d') AS `FECHA`
    FROM `puntuacion` p
    INNER JOIN `jugador` j ON p.`id_jugador` = j.`id`
    INNER JOIN `videojuego` v ON p.`id_videojuego` = v.`id`
    WHERE (p_nombre_videojuego IS NULL 
           OR TRIM(p_nombre_videojuego) = '' 
           OR LOWER(v.`nombre`) = LOWER(TRIM(p_nombre_videojuego))
           OR LOWER(v.`nombre`) LIKE LOWER(CONCAT('%', TRIM(p_nombre_videojuego), '%')))
    ORDER BY p.`puntuacion` DESC;
END$$
-- -----------------------------------------------------
-- RF07: Buscar jugadores por Nombre o Gamertag
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_buscar_jugadores`$$
CREATE PROCEDURE `sp_buscar_jugadores`(
    IN p_criterio VARCHAR(100)
)
BEGIN
    IF p_criterio IS NULL OR TRIM(p_criterio) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error RF07: Debe proporcionar un término de búsqueda (Nombre o Gamertag).';
    END IF;
    SELECT 
        `id` AS `ID`,
        `nombre` AS `NOMBRE`,
        `alias` AS `GAMERTAG`,
        `correo` AS `CORREO`,
        DATE_FORMAT(`fecha_registro`, '%Y-%m-%d') AS `FECHA DE REGISTRO`
    FROM `jugador`
    WHERE `nombre` LIKE CONCAT('%', TRIM(p_criterio), '%')
       OR `alias` LIKE CONCAT('%', TRIM(p_criterio), '%')
    ORDER BY `nombre` ASC;
END$$
-- -----------------------------------------------------
-- RF08: Estadísticas del sistema
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_obtener_estadisticas`$$
CREATE PROCEDURE `sp_obtener_estadisticas`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM `jugador`) AS `total_jugadores`,
        (SELECT COUNT(*) FROM `videojuego`) AS `total_videojuegos`,
        (SELECT COUNT(*) FROM `puntuacion`) AS `total_puntuaciones`,
        COALESCE(ROUND((SELECT AVG(`puntuacion`) FROM `puntuacion`), 2), 0.00) AS `puntuacion_promedio`;
END$$
DELIMITER ;