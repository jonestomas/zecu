# 🤖 Zecubot - Plataforma de Suscripciones

Una plataforma completa de gestión de suscripciones con integración de pagos, automatización y análisis de usuarios.

## 🚀 Características Principales

- 💳 **Integración con MercadoPago** para procesamiento de pagos
- 🔄 **Automatización con N8N** para flujos de trabajo
- 🗄️ **Base de datos Supabase** para gestión de datos
- 🎨 **Interfaz moderna** con Next.js y Tailwind CSS
- 📊 **Gestión de planes** (Free, Basic, Premium, Enterprise)
- 🔐 **Seguridad robusta** con validación de webhooks
- 📱 **Responsive design** para todos los dispositivos

## 🏗️ Estructura del Proyecto

```
zecu/
├── 📁 app/                    # Aplicación Next.js
├── 📁 components/             # Componentes React
├── 📁 config/                 # Archivos de configuración
├── 📁 docs/                   # Documentación
├── 📁 lib/                    # Librerías y servicios
├── 📁 public/                 # Archivos estáticos
├── 📁 scripts/                # Scripts de utilidad
├── 📁 styles/                 # Estilos adicionales
└── 📁 supabase/               # Migraciones de base de datos
```

> 📋 Ver [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) para detalles completos de la estructura.

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd zecu
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales
   ```

4. **Configurar Supabase**
   ```bash
   npm run setup-db
   ```

5. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 📋 Scripts Disponibles

### **Desarrollo**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código
```

### **Base de Datos**
```bash
npm run create-test-user    # Crear usuario de prueba
npm run verify-supabase     # Verificar conexión Supabase
npm run get-users-data      # Obtener datos de usuarios
npm run diagnose-db         # Diagnosticar problemas de BD
npm run fix-rls             # Arreglar políticas RLS
```

## 🔧 Configuración

### **Variables de Entorno Requeridas**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# N8N
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key
```

### **Configuración de Supabase**

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar migraciones desde `supabase/`
3. Configurar políticas RLS según necesidades

### **Configuración de MercadoPago**

1. Crear aplicación en [MercadoPago](https://mercadopago.com)
2. Obtener access token y webhook secret
3. Configurar URLs de webhook

## 📚 Documentación

- [Configuración de MercadoPago](./docs/MERCADOPAGO_SETUP.md)
- [Integración con N8N](./docs/N8N_INTEGRATION.md)
- [Configuración de Supabase](./docs/SUPABASE_SETUP.md)
- [Flujos de Usuario](./docs/USER_FLOWS_DIAGRAM.md)
- [Estructura del Proyecto](./PROJECT_STRUCTURE.md)

## 🎯 Funcionalidades

### **Gestión de Usuarios**
- Registro y autenticación
- Perfiles de usuario
- Historial de suscripciones
- Gestión de planes

### **Sistema de Pagos**
- Integración con MercadoPago
- Procesamiento seguro de pagos
- Gestión de suscripciones
- Webhooks de confirmación

### **Automatización**
- Flujos de trabajo con N8N
- Notificaciones automáticas
- Gestión de trials
- Onboarding de usuarios

### **Panel de Administración**
- Dashboard de métricas
- Gestión de usuarios
- Configuración de planes
- Logs de webhooks

## 🔒 Seguridad

- Validación de webhooks con firmas
- Políticas RLS en Supabase
- Sanitización de datos
- Rate limiting en APIs

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
npm run build
vercel --prod
```

### **Docker**
```bash
docker build -t zecubot .
docker run -p 3000:3000 zecubot
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte y preguntas:
- 📧 Email: support@zecubot.com
- 📱 Discord: [Zecubot Community](https://discord.gg/zecubot)
- 🐛 Issues: [GitHub Issues](https://github.com/zecubot/zecu/issues)

---

**Desarrollado con ❤️ por el equipo de Zecubot**
