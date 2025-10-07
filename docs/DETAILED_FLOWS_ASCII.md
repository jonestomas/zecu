# Diagramas de Flujos Detallados - Zecu

## 🎯 Flujo Principal del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LANDING PAGE                                      │
└─────────────────┬───────────────────────────────────────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                           DECISIÓN DEL USUARIO                             │
    └─────────┬─────────────────────────┬─────────────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────┐    ┌─────────────────────────────────────────────┐
    │   PRUEBA GRATUITA   │    │           PLANES PAGOS                       │
    │   (7 días gratis)   │    │        (Básico/Premium)                     │
    └─────────┬───────────┘    └─────────┬───────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────┐    ┌─────────────────────────────────────────────┐
    │   MODAL ONBOARDING  │    │         BOTÓN DE PAGO                       │
    │                     │    │                                             │
    │ 1. Bienvenida       │    │  • Plan Básico (AR$1.999)                  │
    │ 2. Ingresa WhatsApp │    │  • Plan Premium (AR$5.999)                 │
    │ 3. Redirige WhatsApp│    │                                             │
    └─────────┬───────────┘    └─────────┬───────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────┐    ┌─────────────────────────────────────────────┐
    │   VALIDACIÓN API    │    │         MERCADO PAGO                        │
    │                     │    │                                             │
    │ POST /subscriptions │    │  • Formulario de pago                       │
    │ /free-plan          │    │  • Procesamiento seguro                     │
    │                     │    │  • Webhook de confirmación                  │
    └─────────┬───────────┘    └─────────┬───────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────┐    ┌─────────────────────────────────────────────┐
    │   CREACIÓN EN       │    │         WEBHOOK DE PAGO                     │
    │   SUPABASE          │    │                                             │
    │                     │    │  • Recibe confirmación                      │
    │ Estado: PENDING     │    │  • Valida pago                             │
    │ Duración: 7 días    │    │  • Actualiza suscripción                   │
    └─────────┬───────────┘    └─────────┬───────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              n8n WORKFLOW                                 │
    │                                                                             │
    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
    │  │   Webhook       │───▶│   Procesar      │───▶│   Actualizar Supabase   │ │
    │  │   Receiver      │    │   Evento        │    │                         │ │
    │  └─────────────────┘    └─────────────────┘    └─────────────────────────┘ │
    │                                                         │                 │
    │  ┌─────────────────┐    ┌─────────────────┐            │                 │
    │  │   Enviar        │◀───│   Determinar    │◀───────────┘                 │
    │  │   Notificación  │    │   Acción        │                              │
    │  └─────────────────┘    └─────────────────┘                              │
    └─────────────────────────────────────────────────────────────────────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────────┐    ┌─────────────────────────────────────────────┐
    │   WHATSAPP BOT      │    │         EMAIL SERVICE                       │
    │                     │    │                                             │
    │  • Mensaje bienvenida│   │  • Confirmación de pago                    │
    │  • Procesa respuestas│   │  • Notificaciones de cambio                │
    │  • Activa suscripción│   │  • Recordatorios de renovación             │
    └─────────┬───────────┘    └─────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                           USUARIO ACTIVO                                  │
    │                                                                             │
    │  • Suscripción activa en Supabase                                          │
    │  • Puede usar el servicio                                                  │
    │  • Recibe notificaciones                                                   │
    └─────────────────┬───────────────────────────────────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        DASHBOARD DE USUARIO                                │
    │                                                                             │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
    │  │   Ver Plan      │  │   Cambiar Plan  │  │   Cancelar Suscripción      │ │
    │  │   Actual        │  │                 │  │                             │ │
    │  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
    │                                                         │                 │
    │  ┌─────────────────┐  ┌─────────────────┐            │                 │
    │  │   Historial     │  │   Análisis      │            │                 │
    │  │   de Uso        │  │   Realizados    │            │                 │
    │  └─────────────────┘  └─────────────────┘            │                 │
    └─────────────────────────────────────────────────────┬───────────────────────┘
                                                          │
                                                          ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        GESTIÓN DE SUSCRIPCIONES                            │
    │                                                                             │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
    │  │   UPGRADE       │  │   DOWNGRADE     │  │   CANCELACIÓN               │ │
    │  │                 │  │                 │  │                             │ │
    │  │ • Nuevo pago    │  │ • Proceso       │  │ • Confirmación              │ │
    │  │ • Actualización │  │   automático    │  │ • Proceso inmediato         │ │
    │  │ • Notificación  │  │ • Notificación  │  │ • Notificación              │ │
    │  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
    └─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Estados de Suscripción

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PENDING   │───▶│   ACTIVE    │───▶│   EXPIRED   │───▶│ CANCELLED   │
│             │    │             │    │             │    │             │
│ • Creada    │    │ • Activada  │    │ • Expirada  │    │ • Cancelada │
│ • Esperando │    │ • En uso    │    │ • Sin acceso│    │ • Finalizada│
│   activación│    │ • Funcional │    │ • Puede     │    │             │
│             │    │             │    │   renovar   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UPGRADED  │    │ DOWNGRADED  │    │   RENEWED   │    │   [END]     │
│             │    │             │    │             │    │             │
│ • Plan      │    │ • Plan      │    │ • Plan      │    │ • Proceso   │
│   superior  │    │   inferior  │    │   renovado  │    │   terminado │
│ • Nuevo     │    │ • Cambio    │    │ • Nuevo     │    │             │
│   pago      │    │   automático│    │   período   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🏗️ Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Landing   │  │  Dashboard  │  │   Admin     │  │    Payment Pages        │ │
│  │    Page     │  │   Usuario   │  │   Panel     │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND - ZECU                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   API       │  │  Webhook    │  │  Services   │  │    Utils & Helpers      │ │
│  │   Routes    │  │  Handlers   │  │             │  │                         │ │
│  │             │  │             │  │ • Subscription│  │ • Validation           │ │
│  │ • /subscriptions│ • /mercadopago│  │   Service   │  │ • Formatting           │ │
│  │ • /payments │  │ • /whatsapp │  │ • Plan       │  │ • Security             │ │
│  │ • /users    │  │ • /n8n      │  │   Service    │  │ • Logging              │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTEGRACIONES                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Mercado    │  │  WhatsApp   │  │    Email    │  │      Analytics          │ │
│  │   Pago      │  │     Bot     │  │   Service   │  │                         │ │
│  │             │  │             │  │             │  │ • Google Analytics      │ │
│  │ • Pagos     │  │ • Mensajes  │  │ • SendGrid  │  │ • Custom Events         │ │
│  │ • Webhooks  │  │ • Comandos  │  │ • Templates │  │ • User Tracking         │ │
│  │ • Refunds   │  │ • Respuestas│  │ • Notifications│ │ • Conversion Tracking  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ORQUESTACIÓN                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              n8n WORKFLOWS                                │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │  Webhook    │  │  Process    │  │  Database   │  │    Notifications    │ │ │
│  │  │  Receiver   │  │   Events    │  │   Updates   │  │                     │ │ │
│  │  │             │  │             │  │             │  │ • WhatsApp          │ │ │
│  │  │ • Subscription│  │ • Business  │  │ • Supabase  │  │ • Email             │ │ │
│  │  │ • Payment   │  │   Logic     │  │ • Updates   │  │ • SMS               │ │ │
│  │  │ • WhatsApp  │  │ • Validation│  │ • Queries   │  │ • Push              │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BASE DE DATOS                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              SUPABASE                                      │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ Subscriptions│  │    Users    │  │  Analyses   │  │      Features       │ │ │
│  │  │             │  │             │  │             │  │                     │ │ │
│  │  │ • Plan info │  │ • Profile   │  │ • Messages  │  │ • Feature flags     │ │ │
│  │  │ • Status    │  │ • WhatsApp  │  │ • Results   │  │ • Usage limits      │ │ │
│  │  │ • Dates     │  │ • Email     │  │ • Timestamps│  │ • Access control    │ │ │
│  │  │ • Metadata  │  │ • Settings  │  │ • Confidence│  │ • Permissions       │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Flujo de Datos entre Componentes

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Usuario   │───▶│   Frontend  │───▶│   Zecu API  │───▶│     n8n     │
│             │    │             │    │             │    │             │
│ • Acciones  │    │ • UI/UX     │    │ • Business  │    │ • Workflows │
│ • Datos     │    │ • Forms     │    │   Logic     │    │ • Processing│
│ • Feedback  │    │ • Validation│    │ • Security  │    │ • Routing   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Supabase   │◀───│  External   │◀───│   n8n       │◀───│   Zecu     │
│             │    │  Services   │    │             │    │   API       │
│ • Database  │    │             │    │ • Webhooks  │    │             │
│ • Auth      │    │ • WhatsApp  │    │ • Logic     │    │ • Events    │
│ • Storage   │    │ • Email     │    │ • Routing   │    │ • Data      │
│ • Functions │    │ • SMS       │    │ • Processing│    │ • Validation│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🎯 Puntos Críticos del Sistema

### **1. Validación de Datos**
```
Usuario → Frontend → API → n8n → Supabase
   │         │        │     │        │
   ▼         ▼        ▼     ▼        ▼
Validación → Sanitización → Verificación → Procesamiento → Almacenamiento
```

### **2. Manejo de Errores**
```
Error → Logging → Notificación → Recuperación → Continuidad
  │        │          │            │            │
  ▼        ▼          ▼            ▼            ▼
Detectado → Registrado → Alertado → Procesado → Resuelto
```

### **3. Seguridad**
```
Request → Authentication → Authorization → Validation → Processing
   │            │              │             │            │
   ▼            ▼              ▼             ▼            ▼
Recibido → Verificado → Autorizado → Validado → Procesado
```

---

**Nota**: Estos diagramas representan la arquitectura completa del sistema Zecu, mostrando todos los flujos de usuario, integraciones y puntos de conexión entre los diferentes componentes.



