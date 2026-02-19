# 🇩🇴 Consulta RNC - República Dominicana

API y plataforma web para consultar información de contribuyentes registrados en la República Dominicana.

## 📋 Características

- ✅ Búsqueda por RNC
- ✅ Búsqueda por nombre o razón social
- ✅ Estadísticas generales
- ✅ API REST completa
- ✅ Interfaz web moderna y responsive
- ✅ Base de datos con 345,283+ contribuyentes activos

## 🚀 Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (Neon)
- **Frontend**: EJS + Tailwind CSS
- **Iconos**: Material Symbols

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/dsantillanAb/consultarnc.git
cd consultarnc
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env` con:
```env
DATABASE_URL=tu_conexion_postgresql
PORT=3000
```

4. Inicia el servidor:
```bash
npm start
```

5. Abre tu navegador en `http://localhost:3000`

## 📚 API Endpoints

### 1. Buscar por RNC
```
GET /api/rnc/:rnc
```

### 2. Buscar por Nombre
```
GET /api/buscar?nombre=:nombre&limit=:limit
```

### 3. Estadísticas
```
GET /api/stats
```

Para más detalles, visita `/documentacion` en la aplicación.

## 🗄️ Estructura del Proyecto

```
consultarnc/
├── views/
│   ├── index.ejs           # Página principal
│   └── documentacion.ejs   # Documentación API
├── public/
│   ├── script.js           # JavaScript del frontend
│   └── styles.css          # Estilos (legacy)
├── server.js               # Servidor Express
├── cargar_rnc.py          # Script para cargar datos
├── package.json
└── README.md
```

## 📊 Base de Datos

La base de datos contiene información de contribuyentes activos con:
- RNC
- Razón Social
- Actividad Económica
- Fecha de Inicio de Operaciones
- Estado
- Régimen de Pago

**Última actualización**: 15 de noviembre de 2025

## 🛠️ Desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 📝 Licencia

MIT

## 👨‍💻 Autor

Daniel Santillan

---

⭐ Si te gusta este proyecto, dale una estrella 
