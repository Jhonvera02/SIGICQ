# SIGICQ — Sistema Inteligente de Gestión de Inventarios, Compras y Abastecimiento 📦

SIGICQ es un prototipo web para centralizar y visualizar procesos relacionados con inventarios, solicitudes internas, abastecimiento de envases y gestión de compras. Está pensado como una herramienta de apoyo para mejorar la trazabilidad y facilitar el seguimiento de existencias y solicitudes entre diferentes áreas.

## ✨ Funcionalidades

- **Dashboard:** indicadores generales y gráficos para consultar el estado de la operación.
- **Inventario:** consulta de productos, categorías, existencias y niveles mínimos.
- **Solicitudes:** registro y seguimiento de solicitudes realizadas por las áreas.
- **Sugeridos de envases:** apoyo al control de envases y materiales de empaque.
- **Aprobaciones:** seguimiento de solicitudes que requieren autorización.
- **Órdenes de compra:** visualización y seguimiento de órdenes de compra.
- **Control de precios:** comparación y análisis de precios de referencia y compra.
- **Alertas:** identificación de existencias que requieren atención.
- **Historial y trazabilidad:** consulta de movimientos y acciones registradas en la aplicación.
- **Administración del sistema:** vista de configuración y gestión de usuarios/roles para la demostración.
- **Tema visual:** interfaz con modo oscuro y estilos adaptados al panel administrativo.

## 🧰 Tecnologías

- **HTML5** — estructura de la interfaz.
- **CSS3** — estilos, diseño adaptable y temas visuales.
- **JavaScript** — lógica de la aplicación y renderizado de vistas.
- **SVG** — gráficos personalizados.
- **localStorage** — persistencia local de datos en el navegador.

## 🚀 Cómo ejecutar el proyecto

SIGICQ es una aplicación web estática, por lo que no requiere instalar dependencias para abrir la versión básica.

### Opción 1: abrir directamente

1. Descarga o clona el repositorio.
2. Abre la carpeta del proyecto.
3. Abre `index.html` en un navegador moderno.

### Opción 2: usar Visual Studio Code

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Si tienes instalada la extensión **Live Server**, haz clic derecho sobre `index.html`.
3. Selecciona **Open with Live Server**.

## 🔐 Acceso de demostración

La interfaz incluye usuarios de ejemplo para explorar las vistas según el rol. En la versión de demostración, la contraseña configurada es `123`.

Usuarios de prueba: `produccion`, `logistica`, `comercial`, `mantenimiento`, `compras`, `gerente` y `sistemas`.

> **Importante:** las credenciales están escritas en el código JavaScript del cliente. Este inicio de sesión es únicamente demostrativo y no proporciona seguridad real. No uses contraseñas reales ni publiques datos personales o empresariales. Para un uso real, la autenticación y los permisos deben validarse en un backend seguro.

## 📁 Estructura del proyecto

```text
SIGICQ/
├── index.html    # Estructura de la aplicación y pantalla de acceso
├── styles.css    # Estilos, diseño adaptable y temas
├── app.js        # Lógica, navegación, datos y renderizado de vistas
└── charts.js     # Utilidades para generar gráficos SVG
```

## 🛣️ Posibles mejoras

- Incorporar un backend y una base de datos centralizada.
- Implementar autenticación segura y autorización de roles del lado del servidor.
- Registrar movimientos de inventario con auditoría y trazabilidad persistente.
- Añadir validaciones, pruebas automatizadas y manejo de errores.
- Incorporar importación/exportación de datos y documentación de la API.
- Preparar despliegue con configuración segura y copias de respaldo.

## 👨‍💻 Autor

**Jhon Vera**  
GitHub: [@Jhonvera02](https://github.com/Jhonvera02)

---

Este proyecto es un prototipo con datos ficticios para fines de aprendizaje y demostración. Antes de usarlo en una empresa, se debe revisar la seguridad, la persistencia de datos y los permisos.
