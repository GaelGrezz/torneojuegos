# Torneo de videojuegos

API REST para administrar jugadores, videojuegos, puntuaciones y reportes usando
Node.js, Express y MySQL.

## 1. Instalar MySQL en Windows

1. Descarga **MySQL Installer for Windows** desde la página oficial:
	 <https://dev.mysql.com/downloads/installer/>
2. Durante la instalación selecciona `MySQL Server` y, opcionalmente, `MySQL Workbench`.
3. Configura el servidor con el puerto `3306`.
4. Crea un usuario MySQL y recuerda su contraseña. El usuario debe tener permisos
	 sobre la base `torneojuegos`.
5. Verifica que el servicio de MySQL esté iniciado desde `services.msc` o desde
	 MySQL Workbench.

## 2. Configurar la conexión

Desde la carpeta `server`, crea `.env` copiando `.env.example`:

```powershell
cd server
Copy-Item .env.example .env
```

Edita `server/.env` con tus datos reales:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin-123
DB_NAME=torneojuegos
DB_CONNECTION_LIMIT=10
```

`server/.env` no debe subirse al repositorio porque contiene credenciales.

## 3. Crear la base de datos

En MySQL Workbench abre una consulta y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS torneojuegos;
USE torneojuegos;
```

Después abre y ejecuta, en este orden:

1. [`sql/tables.sql`](sql/tables.sql)
2. [`sql/procedures.sql`](sql/procedures.sql)

Comprueba que todo se creó correctamente:

```sql
USE torneojuegos;
SHOW TABLES;
SHOW PROCEDURE STATUS WHERE Db = 'torneojuegos';
```

## 4. Instalar e iniciar el servidor

```powershell
cd server
npm install
npm start
```

La API estará disponible en `http://localhost:3000`.

## 5. Probar los endpoints

Ejecuta estos comandos en otra terminal de PowerShell mientras el servidor está
encendido:

```powershell
$base = 'http://localhost:3000'

# Salud de la API
Invoke-WebRequest "$base/" -UseBasicParsing
Invoke-WebRequest "$base/api" -UseBasicParsing

# Registrar un jugador
$jugador = @{
	nombre = 'Carlos Silva'
	alias = 'Shadow'
	correo = 'carlos@email.com'
} | ConvertTo-Json
Invoke-WebRequest "$base/api/jugadores" -Method Post -ContentType 'application/json' -Body $jugador

# Registrar un videojuego
$videojuego = @{
	nombre = 'Tekken'
	genero = 'Lucha'
} | ConvertTo-Json
Invoke-WebRequest "$base/api/videojuegos" -Method Post -ContentType 'application/json' -Body $videojuego

# Consultar y buscar jugadores
Invoke-WebRequest "$base/api/jugadores" -UseBasicParsing
Invoke-WebRequest "$base/api/jugadores/buscar?criterio=Shadow" -UseBasicParsing

# Registrar una puntuación usando los IDs creados
$puntuacion = @{
	id_jugador = 1
	id_videojuego = 1
	puntuacion = 950
} | ConvertTo-Json
Invoke-WebRequest "$base/api/puntuaciones" -Method Post -ContentType 'application/json' -Body $puntuacion

# Consultar reportes
Invoke-WebRequest "$base/api/puntuaciones" -UseBasicParsing
Invoke-WebRequest "$base/api/clasificacion" -UseBasicParsing
Invoke-WebRequest "$base/api/estadisticas" -UseBasicParsing
```

Las respuestas esperadas son `200` para consultas, `201` para registros y `400`
para datos inválidos.

## Estructura del servidor

- `server/config/database.js`: pool de conexión MySQL.
- `server/routes/`: endpoints organizados por recurso.
- `server/validators/`: validaciones con `express-validator`.
- `server/.env`: credenciales locales, excluidas de Git.
