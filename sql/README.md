# Guía de Ejemplos: Procedimientos Almacenados en MySQL

Esta guía muestra únicamente los ejemplos de uso (`CALL`) para interactuar con la base de datos y probar cada uno de los Requerimientos Funcionales (**RF01** a **RF08**).

---

## 1. Ejemplos de Registro de Datos

### **RF01. Registrar jugadores**
Registra nuevos jugadores validando obligatoriedad de campos y unicidad de Gamertag y Correo.

```sql
-- Parámetros: (Nombre, Alias/Gamertag, Correo, Fecha Registro)
CALL sp_registrar_jugador('Carlos Silva', 'Shadow', 'carlos@email.com', '2024-01-15');
CALL sp_registrar_jugador('Ana Martínez', 'Nova', 'ana@email.com', '2024-02-10');
CALL sp_registrar_jugador('Gabriel Torres', 'Ghost', 'gabriel@email.com', '2024-03-05');
```

---

### **RF02. Registrar videojuegos**
Registra nuevos videojuegos evitando nombres duplicados.

```sql
-- Parámetros: (Nombre, Género)
CALL sp_registrar_videojuego('Tekken', 'Lucha');
CALL sp_registrar_videojuego('Street Fighter', 'Lucha');
CALL sp_registrar_videojuego('Halo Infinite', 'Shooter');
```

---

### **RF03 y RF05. Registrar una puntuación**
Permite registrar puntuaciones asociando un jugador y videojuego existentes. Valida que la puntuación no sea negativa.

```sql
-- Parámetros: (ID_Jugador, ID_Videojuego, Puntuación, Fecha)
CALL sp_registrar_puntuacion(1, 1, 950, '2024-05-01'); -- Shadow en Tekken
CALL sp_registrar_puntuacion(2, 1, 820, '2024-05-02'); -- Nova en Tekken
CALL sp_registrar_puntuacion(3, 1, 760, '2024-05-03'); -- Ghost en Tekken
```

---

## 2. Ejemplos de Consultas y Reportes

### **RF04. Consultar jugadores**
Muestra los jugadores registrados mostrando `GAMERTAG | CORREO | FECHA DE REGISTRO`.

```sql
CALL sp_consultar_jugadores();
```

**Resultado esperado:**
| GAMERTAG | CORREO | FECHA DE REGISTRO |
| :--- | :--- | :--- |
| Ghost | gabriel@email.com | 2024-03-05 |
| Nova | ana@email.com | 2024-02-10 |
| Shadow | carlos@email.com | 2024-01-15 |

---

### **RF06. Mostrar clasificación**
Muestra la tabla ordenada de mayor a menor puntuación (`POSICIÓN | JUGADOR | VIDEOJUEGO | PUNTUACIÓN`).

```sql
-- Clasificación filtrada para un videojuego específico:
CALL sp_mostrar_clasificacion('Tekken');

-- Clasificación general (todos los videojuegos):
CALL sp_mostrar_clasificacion(NULL);
```

**Resultado esperado:**
| POSICIÓN | JUGADOR | VIDEOJUEGO | PUNTUACIÓN | FECHA |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Shadow | Tekken | 950 | 2024-05-01 |
| 2 | Nova | Tekken | 820 | 2024-05-02 |
| 3 | Ghost | Tekken | 760 | 2024-05-03 |

---

### **RF07. Buscar jugadores**
Busca coincidencias de jugadores por Nombre o Gamertag.

```sql
-- Búsqueda por término o coincidencia parcial:
CALL sp_buscar_jugadores('Shadow');
CALL sp_buscar_jugadores('Carlos');
```

**Resultado esperado:**
| ID | NOMBRE | GAMERTAG | CORREO | FECHA DE REGISTRO |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Carlos Silva | Shadow | carlos@email.com | 2024-01-15 |

---

### **RF08. Estadísticas**
Calcula en tiempo real el total de jugadores, videojuegos, puntuaciones registradas y la puntuación promedio.

```sql
CALL sp_obtener_estadisticas();
```

**Resultado esperado:**
| total_jugadores | total_videojuegos | total_puntuaciones | puntuacion_promedio |
| :---: | :---: | :---: | :---: |
| 3 | 3 | 3 | 843.33 |

---

## 3. Pruebas de Validación de Errores (Casos Límite)

Ejemplos de llamadas que deben fallar y devolver mensajes de error controlados:

```sql
-- Error RF01: Intento de registrar Gamertag duplicado
CALL sp_registrar_jugador('Otro Usuario', 'Shadow', 'otro@email.com', '2024-05-01');

-- Error RF02: Intento de registrar juego duplicado
CALL sp_registrar_videojuego('Tekken', 'Lucha');

-- Error RF03/RF05: Intento de registrar puntuación negativa
CALL sp_registrar_puntuacion(1, 1, -50, '2024-05-01');

-- Error RF03/RF05: Intento de registrar puntuación con jugador inexistente
CALL sp_registrar_puntuacion(999, 1, 500, '2024-05-01');
```
