# 🎨 Flujo Visual de Onboarding - Zecubot

## 🎯 Resumen Ejecutivo

**La pregunta clave**: ¿Primero login o primero pago?

**Respuesta**: **Ni uno ni otro primero** 😊

## ✨ Flujo Recomendado Simplificado

```
┌────────────┐
│  Landing   │ Usuario descubre Zecubot
└─────┬──────┘
      │
      ▼
┌────────────────────────────────┐
│  Elegir Plan                   │
│  [ ] Free 🆓                   │  ← Usuario decide aquí
│  [ ] Plus ⭐ $19.99            │
└─────┬──────────────────────────┘
      │
      ▼
┌────────────┐
│  Registro  │ Email + Nombre + WhatsApp
│  Rápido    │ (NO necesita contraseña todavía)
└─────┬──────┘
      │
      ├─── Si eligió FREE ───────────────────┐
      │                                      ▼
      │                            ┌──────────────┐
      │                            │ ✅ Activado  │
      │                            │ Ir WhatsApp  │
      │                            └──────────────┘
      │
      └─── Si eligió PLUS ──────┐
                                ▼
                      ┌──────────────────┐
                      │  MercadoPago     │
                      │  Página de Pago  │
                      └────────┬─────────┘
                               │
                      ┌────────┴─────────┐
                      │                  │
                  APROBADO          RECHAZADO
                      │                  │
                      ▼                  ▼
            ┌──────────────┐   ┌──────────────┐
            │ ✅ Activado  │   │ Reintentar   │
            │ Ir WhatsApp  │   │ Pago         │
            └──────────────┘   └──────────────┘
```

## 🎬 Escenarios de Usuario

### **Escenario 1: Usuario que quiere probar gratis**

```
María visita zecubot.com
    ↓
Ve "Comenzar Gratis" 
    ↓
Click → Formulario:
    📧 maria@gmail.com
    👤 María López
    📱 +54 9 11 1234-5678
    ↓
Click "Registrar" (30 segundos)
    ↓
✅ "¡Listo! Tu plan Free está activo"
    ↓
[Abrir WhatsApp] → Comienza a chatear
```

**Tiempo total**: ~1 minuto
**Login requerido**: NO (por ahora)

### **Escenario 2: Usuario que quiere Plan Plus**

```
Juan visita zecubot.com
    ↓
Ve "Plan Plus $19.99" 
    ↓
Click → Formulario:
    📧 juan@empresa.com
    👤 Juan Pérez
    📱 +54 9 11 8765-4321
    ↓
Click "Registrar" (30 segundos)
    ↓
Redirect a MercadoPago
    ↓
Completa pago (1-2 minutos)
    ↓
✅ "¡Pago confirmado! Plan Plus activo"
    ↓
[Abrir WhatsApp] → Comienza a chatear
```

**Tiempo total**: ~3 minutos
**Login requerido**: NO (por ahora)

### **Escenario 3: Usuario que vuelve después**

```
María vuelve a zecubot.com (al día siguiente)
    ↓
Click "Iniciar Sesión" (en navbar)
    ↓
Ingresa: maria@gmail.com
    ↓
Recibe código por email: 123456
    ↓
Ingresa código
    ↓
✅ Accede a su dashboard
```

**Tiempo total**: ~30 segundos
**Login requerido**: SÍ (para acceso posterior)

## 🔑 ¿Cuándo se necesita Login?

### **NO se necesita login para:**
- ✅ Registrarse por primera vez
- ✅ Elegir plan
- ✅ Hacer el pago
- ✅ Conectar WhatsApp

### **SÍ se necesita login para:**
- ✅ Volver a acceder al dashboard
- ✅ Ver historial de conversaciones
- ✅ Cambiar de plan
- ✅ Ver facturas
- ✅ Gestionar suscripción

## 🎯 Comparación de Flujos

### **❌ Flujo Complejo (NO recomendado)**

```
Landing → Registro con contraseña → Verificar email → 
Login → Elegir plan → [Pagar] → Configurar → WhatsApp
```
**Pasos**: 7-8
**Tiempo**: 5-10 minutos
**Fricción**: Alta ❌

### **✅ Flujo Simple (RECOMENDADO)**

```
Landing → Elegir plan → Registro rápido → 
[Si Plus: Pagar] → WhatsApp
```
**Pasos**: 3-4
**Tiempo**: 1-3 minutos  
**Fricción**: Baja ✅

## 📱 Interfaz de Usuario

### **Paso 1: Landing Page**

```html
┌─────────────────────────────────────────────────────────────┐
│  🤖 Zecubot - Tu Asistente Inteligente en WhatsApp         │
│                                                             │
│  Navbar: [Inicio] [Planes] [Ayuda] [Iniciar Sesión]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Elige tu plan y comienza hoy                   │
│                                                             │
│   ┌────────────────────┐    ┌──────────────────────┐      │
│   │   Plan Free 🆓     │    │   Plan Plus ⭐        │      │
│   │                    │    │                      │      │
│   │   $0 / siempre     │    │   $19.99 / mes       │      │
│   │                    │    │                      │      │
│   │ • 10 msgs/día      │    │ • 500 msgs/día       │      │
│   │ • 3 conversaciones │    │ • 50 conversaciones  │      │
│   │ • Respuestas       │    │ • IA Avanzada        │      │
│   │   básicas          │    │ • Soporte 24/7       │      │
│   │                    │    │ • Análisis           │      │
│   │                    │    │ • Historial completo │      │
│   │                    │    │                      │      │
│   │ [Comenzar Gratis]  │    │ [Suscribirme]        │      │
│   │                    │    │                      │      │
│   │ Sin tarjeta        │    │ Cancela cuando       │      │
│   │ requerida          │    │ quieras              │      │
│   └────────────────────┘    └──────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Paso 2: Registro (mismo para ambos planes)**

```html
┌─────────────────────────────────────────────────────────────┐
│  Crea tu cuenta en Zecubot                                  │
│  Plan seleccionado: [Free 🆓 / Plus ⭐]                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📧 Tu email                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ tu-email@ejemplo.com                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  👤 Tu nombre                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tu Nombre                                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  📱 Tu WhatsApp (con código de país)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ +54 9 11 1234-5678                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  💡 A este número enviarás mensajes a Zecubot             │
│                                                             │
│  ☐ Acepto los términos y condiciones                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Continuar  →                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ¿Ya tienes cuenta? Iniciar sesión                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Paso 3A: Confirmación Free (sin pago)**

```html
┌─────────────────────────────────────────────────────────────┐
│  ✅ ¡Tu cuenta está lista!                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🎉 Plan Free activado correctamente                 │
│                                                             │
│  Para comenzar a usar Zecubot:                              │
│                                                             │
│  1️⃣ Guarda este número en tu WhatsApp:                      │
│     ┌─────────────────────────────────────────────┐        │
│     │  +XX XXX XXX XXX  [Copiar]                 │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│  2️⃣ O haz click aquí para abrir WhatsApp:                  │
│     ┌─────────────────────────────────────────────┐        │
│     │  [📱 Abrir WhatsApp]                        │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│  3️⃣ Envía tu primer mensaje: "Hola"                        │
│                                                             │
│  ✨ Tu plan incluye:                                        │
│     • 10 mensajes por día                                   │
│     • 3 conversaciones simultáneas                          │
│     • Respuestas básicas                                    │
│                                                             │
│  💡 ¿Quieres más? Actualiza a Plan Plus                    │
│     [Ver Plan Plus]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Paso 3B: Pago Plus (MercadoPago)**

```html
┌─────────────────────────────────────────────────────────────┐
│  Completa tu suscripción                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Resumen de tu compra:                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Plan Plus ⭐                               $19.99   │  │
│  │  Suscripción mensual                                 │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  Total a pagar:                             $19.99   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ✨ Incluye:                                                │
│     ✓ 500 mensajes por día                                  │
│     ✓ IA Avanzada                                           │
│     ✓ Soporte prioritario 24/7                              │
│     ✓ Análisis completo                                     │
│                                                             │
│  💳 Método de pago:                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │       [MercadoPago Checkout Button]                 │  │
│  │                                                      │  │
│  │   💳 Tarjeta de crédito/débito                      │  │
│  │   🏦 Transferencia bancaria                         │  │
│  │   💵 Efectivo (Rapipago, PagoFácil)                 │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🔒 Pago 100% seguro con MercadoPago                       │
│  🔄 Cancela cuando quieras                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Login (Solo cuando vuelve)

```html
┌─────────────────────────────────────────────────────────────┐
│  Iniciar Sesión en Zecubot                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📧 Email o WhatsApp                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ tu-email@ejemplo.com                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Enviar código de acceso                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Te enviaremos un código a tu email/WhatsApp               │
│                                                             │
│  ─────────────────── o ───────────────────                 │
│                                                             │
│  [🔗 Recibir Magic Link por email]                         │
│                                                             │
│  ¿No tienes cuenta? Regístrate                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Respuesta a tu Pregunta

### **"¿Primero login y después MercadoPago?"**

**NO** ❌

**Flujo correcto:**

```
1. Elegir Plan
2. Registro (email + nombre + WhatsApp)
3. [Si Plus] MercadoPago
4. Activación
5. WhatsApp

Login solo cuando vuelve después
```

### **¿Por qué este orden?**

✅ **Menos fricción**: El usuario no necesita recordar contraseña
✅ **Más conversión**: Menos pasos = más completados
✅ **Experiencia simple**: Directo al grano
✅ **Verificación natural**: WhatsApp verifica identidad
✅ **Flexibilidad**: Login después cuando lo necesite

## 🚀 Next Steps

¿Quieres que implemente:
1. Los componentes de UI para este flujo?
2. Las rutas y APIs necesarias?
3. La integración completa con MercadoPago?

Dime y lo hacemos 💪
