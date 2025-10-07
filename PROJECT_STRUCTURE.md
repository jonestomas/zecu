# 📁 Estructura del Proyecto Zecubot

## 🏗️ Organización de Carpetas

```
zecu/
├── 📁 app/                          # Aplicación Next.js
│   ├── 📁 admin/                    # Panel de administración
│   │   └── 📁 webhooks/            # Gestión de webhooks
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 create-payment/      # Creación de pagos
│   │   ├── 📁 subscriptions/       # Gestión de suscripciones
│   │   ├── 📁 test-n8n/            # Pruebas de N8N
│   │   ├── 📁 test-webhook/        # Pruebas de webhooks
│   │   └── 📁 webhooks/            # Webhooks externos
│   │       └── 📁 mercadopago/     # Webhooks de MercadoPago
│   ├── 📁 payment/                  # Páginas de pago
│   │   ├── 📁 failure/             # Pago fallido
│   │   ├── 📁 pending/             # Pago pendiente
│   │   └── 📁 success/             # Pago exitoso
│   ├── layout.tsx                   # Layout principal
│   ├── page.tsx                     # Página principal
│   └── globals.css                  # Estilos globales
│
├── 📁 components/                   # Componentes React
│   ├── 📁 ui/                       # Componentes de UI base
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   ├── free-plan-onboarding.tsx    # Onboarding plan gratuito
│   ├── free-trial-button.tsx       # Botón de prueba gratuita
│   ├── payment-button.tsx          # Botón de pago
│   ├── secure-payment-button.tsx   # Botón de pago seguro
│   └── theme-provider.tsx          # Proveedor de tema
│
├── 📁 config/                       # Archivos de configuración
│   ├── components.json              # Configuración de componentes
│   ├── next.config.mjs              # Configuración de Next.js
│   ├── postcss.config.mjs           # Configuración de PostCSS
│   └── tailwind.config.js           # Configuración de Tailwind
│
├── 📁 docs/                         # Documentación
│   ├── DETAILED_FLOWS_ASCII.md     # Flujos detallados (ASCII)
│   ├── FLOWS_SUMMARY.md            # Resumen de flujos
│   ├── MERCADOPAGO_SETUP.md        # Configuración MercadoPago
│   ├── N8N_FREE_PLAN_WORKFLOW.md   # Workflow N8N plan gratuito
│   ├── N8N_INTEGRATION.md          # Integración con N8N
│   ├── README.md                    # Documentación principal
│   ├── SUPABASE_SETUP.md           # Configuración Supabase
│   └── USER_FLOWS_DIAGRAM.md       # Diagramas de flujo de usuario
│
├── 📁 lib/                          # Librerías y utilidades
│   ├── api-security.ts              # Seguridad de API
│   ├── env-config.ts                # Configuración de variables
│   ├── mercadopago.ts               # Integración MercadoPago
│   ├── n8n-integration.ts           # Integración N8N
│   ├── plans.ts                     # Gestión de planes
│   ├── subscription-service.ts      # Servicio de suscripciones
│   ├── utils.ts                     # Utilidades generales
│   ├── webhook-logger.ts            # Logger de webhooks
│   ├── webhook-security.ts          # Seguridad de webhooks
│   └── webhook-security-v2.ts       # Seguridad webhooks v2
│
├── 📁 public/                       # Archivos estáticos
│   ├── placeholder-logo.png         # Logo placeholder
│   ├── placeholder-logo.svg         # Logo SVG placeholder
│   ├── placeholder-user.jpg         # Usuario placeholder
│   ├── placeholder.jpg              # Imagen placeholder
│   └── placeholder.svg              # SVG placeholder
│
├── 📁 scripts/                      # Scripts de utilidad
│   ├── 📁 database/                 # Scripts de base de datos
│   │   ├── diagnose-users-table.js  # Diagnóstico tabla usuarios
│   │   └── fix-users-rls.js         # Arreglo políticas RLS
│   └── 📁 utils/                    # Scripts de utilidad
│       ├── create-test-user.js      # Crear usuario de prueba
│       ├── get-users-data.js        # Obtener datos usuarios
│       └── verify-supabase.js       # Verificar conexión Supabase
│
├── 📁 styles/                       # Estilos adicionales
│   └── globals.css                  # Estilos globales
│
├── 📁 supabase/                     # Migraciones de Supabase
│   ├── 00_setup_database.sql        # Configuración inicial
│   ├── 01_create_tables.sql         # Creación de tablas
│   ├── 02_create_indexes.sql        # Creación de índices
│   ├── 03_create_functions.sql      # Creación de funciones
│   ├── 04_create_triggers.sql       # Creación de triggers
│   ├── 05_create_rls.sql            # Configuración RLS
│   ├── 06_seed_data.sql             # Datos iniciales
│   └── 07_verify_setup.sql          # Verificación de setup
│
├── 📄 next-env.d.ts                 # Tipos de Next.js
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 package-lock.json             # Lock de dependencias
├── 📄 tsconfig.json                 # Configuración TypeScript
└── 📄 PROJECT_STRUCTURE.md          # Este archivo
```

## 🎯 Propósito de Cada Carpeta

### **📁 app/**
Aplicación principal de Next.js con todas las rutas y páginas.

### **📁 components/**
Componentes reutilizables de React organizados por funcionalidad.

### **📁 config/**
Archivos de configuración del proyecto (Next.js, Tailwind, PostCSS, etc.).

### **📁 docs/**
Toda la documentación del proyecto en formato Markdown.

### **📁 lib/**
Librerías, utilidades y servicios del proyecto.

### **📁 public/**
Archivos estáticos accesibles públicamente.

### **📁 scripts/**
Scripts de utilidad organizados por categoría:
- **database/**: Scripts relacionados con la base de datos
- **utils/**: Scripts de utilidad general

### **📁 styles/**
Archivos de estilos adicionales.

### **📁 supabase/**
Migraciones y scripts de configuración de Supabase.

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm run start

# Linting
npm run lint

# Scripts de utilidad
npm run create-test-user
npm run verify-supabase
```

## 📋 Convenciones

- **Archivos de configuración**: En `config/`
- **Documentación**: En `docs/`
- **Scripts de base de datos**: En `scripts/database/`
- **Scripts de utilidad**: En `scripts/utils/`
- **Componentes UI**: En `components/ui/`
- **Servicios**: En `lib/`
