# Guía de Arquitectura y Procedimientos Almacenados en MySQL
## Sistema de Torneo de Videojuegos y Puntuaciones

Este documento describe la arquitectura de base de datos normalizada y proporciona los ejemplos de uso (`CALL`) para todos los procedimientos almacenados (CRUD completo y consultas especializadas) definidos en `tables.sql` y `procedures.sql`.

---

## 1. Modificaciones e Innovaciones en la Estructura de Tablas

Se aplicó un proceso de **normalización (3FN)** sobre la estructura inicial:

1. **Tabla `genero` (Nueva Entidad Catálogo)**: Se independizó la entidad de géneros para evitar redundancia de texto y controlar los géneros disponibles (`id`, `nombre` ÚNICO).
2. **Normalización en `videojuego`**:
   * Se reemplazó la columna de texto `genero VARCHAR(20)` por la llave foránea `id_genero INT UNSIGNED NULL`.
   * Se añadió `ON DELETE SET NULL` para que la eliminación de un género no borre los videojuegos asociados, dejándolos marcados como "sin género".
3. **Validación de Correo**: En `sp_registrar_jugador` y `sp_modificar_jugador` se agregó validación de formato mediante `LIKE '%_@_%.__%'`.
4. **Fechas Automáticas y Restricción No Negativa**: `fecha_registro` y `fecha` utilizan `DEFAULT (CURRENT_DATE)` y la puntuación valida `CHECK (puntuacion >= 0)`.

---

## 2. Guía de Ejecución y Ejemplos de Procedimientos (CRUD y Reportes)

### 2.1. Gestión de Géneros (`genero`)

```sql
-- [CREATE] Registrar géneros
CALL sp_registrar_genero('Metroidvania');
CALL sp_registrar_genero('RPG');
CALL sp_registrar_genero('Lucha');

-- [READ] Consultar géneros registrados
CALL sp_consultar_generos();

-- [UPDATE] Modificar un género
CALL sp_modificar_genero(1, 'Metroidvania / Plataforma');

-- [DELETE] Eliminar un género (Los videojuegos mantendrán id_genero = NULL)
CALL sp_eliminar_genero(3);
```

---

### 2.2. Gestión de Videojuegos (`videojuego`)

```sql
-- [CREATE] Registrar videojuegos asociando el ID de género
-- Parámetros: (Nombre, ID_Genero)
CALL sp_registrar_videojuego('Hollow Knight', 1);
CALL sp_registrar_videojuego('Elden Ring', 2);
CALL sp_registrar_videojuego('Juego Indie', NULL); -- Género opcional

-- [READ] Consultar videojuegos (incluye el nombre del género o 'sin género')
CALL sp_consultar_videojuegos();

-- [UPDATE] Modificar nombre o género de un videojuego
CALL sp_modificar_videojuego(1, 'Hollow Knight: Silksong', 1);

-- [DELETE] Eliminar videojuego (elimina en cascada sus puntuaciones asociadas)
CALL sp_eliminar_videojuego(3);
```

---

### 2.3. Gestión de Jugadores (`jugador`)

```sql
-- [CREATE] Registrar jugadores
-- Parámetros: (Nombre, Gamertag/Alias, Correo)
CALL sp_registrar_jugador('Enrique Herrera', 'Enkrid', 'enrique@correo.com');
CALL sp_registrar_jugador('Carlos López', 'DevKing', 'carlos@correo.com');

-- [READ] Consultar todos los jugadores (RF04)
CALL sp_consultar_jugadores();

-- [SEARCH] Buscar jugador por Nombre o Gamertag (RF07)
CALL sp_buscar_jugadores('Enkrid');
CALL sp_buscar_jugadores('Carlos');

-- [UPDATE] Modificar información de un jugador
CALL sp_modificar_jugador(1, 'Enrique H.', 'Enkrid_Pro', 'enrique_nuevo@correo.com');

-- [DELETE] Eliminar jugador y sus puntuaciones asociadas
CALL sp_eliminar_jugador(2);
```

---

### 2.4. Gestión de Puntuaciones y Clasificación (`puntuacion`)

```sql
-- [CREATE] Registrar puntuación
-- Parámetros: (ID_Jugador, ID_Videojuego, Puntuacion)
CALL sp_registrar_puntuacion(1, 1, 1500);
CALL sp_registrar_puntuacion(2, 1, 2300);

-- [READ] Consultar puntuaciones generales
CALL sp_consultar_puntuaciones();

-- [LEADERBOARD] Mostrar clasificación ordenada de mayor a menor (RF06)
-- Clasificación específica para un juego por su ID:
CALL sp_mostrar_clasificacion(1);

-- Clasificación general (todos los videojuegos):
CALL sp_mostrar_clasificacion(NULL);

-- [UPDATE] Actualizar el puntaje de un registro
CALL sp_modificar_puntuacion(1, 1800);

-- [DELETE] Eliminar un registro de puntuación
CALL sp_eliminar_puntuacion(1);
```

---

### 2.5. Estadísticas del Sistema (RF08)

```sql
-- Devuelve total_jugadores, total_generos, total_videojuegos, total_puntuaciones y puntuacion_promedio
CALL sp_obtener_estadisticas();
```

---

## 3. Pruebas QA de Excepciones y Errores Controlados

Las siguientes llamadas permiten verificar que el sistema detiene registros inválidos:

```sql
-- Error: Registrar género duplicado
CALL sp_registrar_genero('rpg');

-- Error: Formato de correo inválido
CALL sp_registrar_jugador('Ana', 'AnaGamer', 'correo_invalido.com');

-- Error: Gamertag o Correo duplicado
CALL sp_registrar_jugador('Otro', 'Enkrid_Pro', 'otro@correo.com');

-- Error: ID de género inexistente al registrar juego
CALL sp_registrar_videojuego('Juego Raro', 999);

-- Error: Puntuación negativa
CALL sp_registrar_puntuacion(1, 1, -100);

-- Error: Clasificación con juego inexistente
CALL sp_mostrar_clasificacion(999);
```
