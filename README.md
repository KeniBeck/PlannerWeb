## 🚢 CargoPlanner - Sistema de Gestión Marítima

<div align="center">
  <img src="public/assets/favicon.ico" alt="CargoPlanner Logo" width="120"/>
  <br/>
  <h3>Planificación y seguimiento eficiente de operaciones marítimas</h3>
</div>

## 📋 Descripción

CargoPlanner es una aplicación web moderna diseñada para gestionar operaciones marítimas de manera eficiente y centralizada. Permite la administración completa del ciclo de vida de operaciones, incluyendo asignación de trabajadores, supervisores, áreas y clientes, con un sistema de seguimiento en tiempo real y generación de reportes.

## ✨ Características principales

- **📊 Dashboard interactivo** - Visualización clara de estadísticas y operaciones en curso
- **🔍 Filtros avanzados** - Búsqueda por supervisores, áreas, fechas y estados
- **👷 Gestión de trabajadores** - Asignación individual o por grupos a operaciones
- **👨‍💼 Control de supervisores** - Asignación de responsables a cada operación
- **📝 Operaciones detalladas** - Información completa con fechas, horarios y ubicaciones
- **📁 Gestión de clientes** - Base de datos centralizada de clientes y su información
- **🏢 Áreas de trabajo** - Organización de operaciones por áreas y zonas
- **📈 Reportes estadísticos** - Visualización de datos para toma de decisiones
- **⬇️ Exportación a Excel** - Generación de reportes en formato Excel
- **👤 Perfiles de usuario** - Gestión de información personal y roles

## 🛠️ Tecnologías utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Bundler**: Vite
- **Gestión de estado**: Context API
- **Gráficos**: Chart.js
- **Tablas y UI**: Componentes personalizados
- **Exportación de datos**: ExcelJS
- **Iconos**: React Icons
- **Alertas**: SweetAlert2
- **Formularios**: React Hook Form
- **Fechas**: date-fns

## 🏗️ Estructura del proyecto

```
src/
├── assets/            # Recursos estáticos
├── components/        # Componentes reutilizables
│   ├── custom/        # Componentes personalizados
│   ├── dialog/        # Modales y alertas
│   └── ui/            # Componentes de interfaz de usuario
├── contexts/          # Contextos para estado global
├── core/              # Modelos y lógica central
│   └── model/         # Interfaces y tipos
├── lib/               # Utilidades y hooks
│   ├── hooks/         # Custom hooks
│   └── utils/         # Funciones utilitarias
├── middleware/        # Middleware para autenticación
├── services/          # Servicios para API
│   └── interfaces/    # Interfaces para DTO
└── views/             # Páginas principales
    ├── Dashboard/     # Componentes del dashboard principal
    ├── areas/         # Gestión de áreas
    ├── clients/       # Gestión de clientes
    ├── operation/     # Gestión de operaciones
    ├── profile/       # Perfil de usuario
    ├── reports/       # Reportes y estadísticas
    ├── supervisors/   # Gestión de supervisores
    ├── users/         # Administración de usuarios
    └── workers/       # Gestión de trabajadores
```

## 🚀 Instalación y configuración

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/CargoPlanner-Web.git
   cd cargo-planner
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   - Renombra `.env.example` a .env
   - Ajusta las variables de entorno según tu configuración

4. **Iniciar en modo desarrollo**

   ```bash
   npm run dev
   ```

5. **Compilar para producción**
   ```bash
   npm run build
   ```

## 🔄 Flujo de trabajo

1. **Inicio de sesión**: Autenticación con credenciales asignadas
2. **Dashboard**: Visualización de estadísticas generales y operaciones recientes
3. **Operaciones**: Creación, edición y seguimiento de operaciones marítimas
   - Asignación de trabajadores individualmente o por grupos
   - Programación de fechas y horarios
   - Asignación de supervisores y áreas
4. **Trabajadores**: Gestión del personal disponible para asignar a operaciones
5. **Supervisores**: Administración de personal responsable de operaciones
6. **Áreas**: Configuración de zonas de trabajo y áreas operativas
7. **Clientes**: Administración de la cartera de clientes
8. **Reportes**: Generación de informes y estadísticas para toma de decisiones

## 📱 Características de la interfaz

- **Diseño responsivo**: Adaptable a dispositivos móviles y escritorio
- **Tema personalizable**: Colores corporativos configurables
- **Filtros contextuales**: Búsqueda inteligente en cada sección
- **Tablas interactivas**: Ordenamiento, paginación y filtrado avanzado
- **Gráficos dinámicos**: Visualización de datos actualizada en tiempo real
- **Modales y diálogos**: Interfaces intuitivas para creación y edición

## 🔐 Roles y permisos

- **Administrador**: Acceso completo a todas las funcionalidades
- **Supervisor**: Gestión de operaciones asignadas y trabajadores
- **Coordinador**: Supervisión de múltiples operaciones y asignación de recursos
- **Gestión Humana**: Administración de personal y trabajadores

## 👨‍💻 Colaboradores principales

El proyecto fue iniciado y es mantenido por:

<table> <tr> <td align="center"> <a href="https://github.com/KeniBeck"> <img src="https://github.com/KeniBeck.png" width="100px;" alt="KeniBeck" style="border-radius: 50%;"/> <br /> <sub><b>KeniBeck</b></sub> </a> <br /> <sub>Arquitectura & Backend</sub> </td> <td align="center"> <a href="https://github.com/pkgzx"> <img src="https://github.com/pkgzx.png" width="100px;" alt="pkgzx" style="border-radius: 50%;"/> <br /> <sub><b>pkgzx</b></sub> </a> <br /> <sub>Frontend & UX/UI</sub> </td> </tr> </table>

## 🤝 Contribuciones

1. Crea un fork del repositorio
2. Crea una rama para tu función (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva característica'`)
4. Sube tus cambios (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia BSD 3-Clause](./LICENSE.md). Consulta el archivo LICENSE.md para más detalles.

---

<div align="center">
  <p>Desarrollado con ❤️ por el equipo de CargoPlanner</p>
  <p>© 2024 CargoPlanner. Todos los derechos reservados.</p>
</div>
