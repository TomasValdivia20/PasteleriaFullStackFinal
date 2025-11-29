# 🍰 Pastelería Mil Sabores - Full Stack Application

Aplicación web completa para gestión de pastelería, construida con Spring Boot (backend) y React + Vite (frontend).

## 🏗️ Arquitectura del Proyecto

```
PasteleriaFullStackFinal/
├── Backend/                 # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/milsabores/backend/
│   │   │   │   ├── config/          # Configuraciones (CORS, etc.)
│   │   │   │   ├── controller/      # Controladores REST
│   │   │   │   ├── model/           # Entidades JPA
│   │   │   │   ├── repository/      # Repositorios Spring Data
│   │   │   │   ├── service/         # Lógica de negocio
│   │   │   │   └── loader/          # Inicialización de datos
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-development.properties
│   │   │       └── application-production.properties
│   │   └── test/
│   ├── railway.json         # Configuración Railway
│   ├── Procfile            # Comandos de inicio
│   └── pom.xml             # Dependencias Maven
│
└── Frontend/               # React + Vite SPA
    ├── public/
    │   └── assets/         # Imágenes y recursos estáticos
    ├── src/
    │   ├── api.js          # Cliente Axios configurado
    │   ├── components/     # Componentes React
    │   ├── context/        # Context API (Carrito, User)
    │   ├── pages/          # Páginas de la aplicación
    │   ├── utils/          # Utilidades
    │   └── Backoffice/     # Panel de administración
    ├── vercel.json         # Configuración Vercel
    ├── vite.config.js      # Configuración Vite
    └── package.json        # Dependencias npm
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Spring Boot 3.2.3** - Framework principal
- **Spring Data JPA** - ORM y persistencia
- **MySQL 8** - Base de datos
- **Lombok** - Reducción de código boilerplate
- **Maven** - Gestión de dependencias
- **Java 17** - Lenguaje de programación

### Frontend
- **React 19** - Biblioteca UI
- **Vite 7** - Build tool y dev server
- **React Router DOM 7** - Enrutamiento SPA
- **Axios** - Cliente HTTP
- **Bootstrap 5** - Framework CSS
- **Vitest** - Testing framework

## 📦 Deployment

### Production Environments

- **Backend**: Railway ([Ver guía](./Backend/RAILWAY_DEPLOYMENT.md))
- **Frontend**: Vercel ([Ver guía](./Frontend/VERCEL_DEPLOYMENT.md))
- **Database**: MySQL en Railway

### Guía Completa

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones detalladas de deployment.

## 🛠️ Desarrollo Local

### Requisitos Previos

- Java 17 o superior
- Node.js 18 o superior
- MySQL 8 o superior
- Maven 3.6+ (o usar el wrapper incluido)

### Backend

```bash
cd Backend

# Configurar base de datos MySQL
# Crear database: pasteleria_db
# Usuario: usuario_spring
# Contraseña: PasteleriaMilSabores123!

# Ejecutar aplicación
./mvnw spring-boot:run

# O con perfil específico
./mvnw spring-boot:run -Dspring-boot.run.profiles=development
```

El backend estará disponible en: `http://localhost:8080`

### Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Configurar variable de entorno (crear archivo .env)
echo "VITE_API_URL=http://localhost:8080/api" > .env

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🧪 Testing

### Backend

```bash
cd Backend
./mvnw test
```

### Frontend

```bash
cd Frontend
npm test              # Ejecutar tests una vez
npm run test:watch    # Ejecutar tests en modo watch
```

## 📊 API Endpoints

### Categorías

```
GET    /api/categorias           # Listar todas las categorías
GET    /api/categorias/{id}      # Obtener una categoría
POST   /api/categorias           # Crear categoría
PUT    /api/categorias/{id}      # Actualizar categoría
DELETE /api/categorias/{id}      # Eliminar categoría
```

### Productos

```
GET    /api/productos                  # Listar todos los productos
GET    /api/productos/{id}             # Obtener un producto
GET    /api/productos/categoria/{id}   # Productos por categoría
POST   /api/productos                  # Crear producto
PUT    /api/productos/{id}             # Actualizar producto
DELETE /api/productos/{id}             # Eliminar producto
```

## 🏛️ Arquitectura y Patrones

### Backend (Clean Architecture)

```
Presentation Layer (Controllers)
         ↓
Business Logic Layer (Services)
         ↓
Data Access Layer (Repositories)
         ↓
Database (MySQL)
```

### Frontend (Component-Based)

```
Pages (Routing)
  ↓
Components (UI)
  ↓
Context (State Management)
  ↓
API Client (Axios)
```

## 🔒 Seguridad

- CORS configurado para dominios específicos
- Variables de entorno para credenciales sensibles
- HTTPS en producción (Railway y Vercel)
- Validación de datos en backend
- Error handling robusto

## 📝 Variables de Entorno

### Backend (Railway)

```bash
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=jdbc:mysql://...
DB_USERNAME=...
DB_PASSWORD=...
FRONTEND_URL=https://tu-app.vercel.app
PORT=${PORT}
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://tu-backend.railway.app/api
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👥 Autor

- **Tomás Valdivia** - [TomasValdivia20](https://github.com/TomasValdivia20)

## 📞 Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Última actualización**: Noviembre 2025
