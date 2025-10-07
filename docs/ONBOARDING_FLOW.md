# 🚀 Flujo de Onboarding - Zecubot

## 🎯 Objetivo del Onboarding

Llevar al usuario desde el descubrimiento hasta el uso activo del servicio de manera fluida y sin fricciones.

## 📊 Flujo Recomendado (Opción A - Recomendada)

```
Landing Page → Elegir Plan → Registro → [Si Plan Plus] Pago → WhatsApp/Chat
```

### **Ventajas:**
- ✅ El usuario sabe qué plan quiere desde el inicio
- ✅ Registro rápido (email + WhatsApp)
- ✅ Solo pagan los que eligen Plus
- ✅ Free users empiezan inmediatamente

## 🔄 Flujos Detallados por Plan

### **🆓 Plan Free (Sin Pago)**

```
1. Landing Page
   ↓
2. Click "Comenzar Gratis"
   ↓
3. Formulario de Registro
   - Email
   - Nombre
   - WhatsApp
   ↓
4. Confirmación
   "¡Cuenta creada! Plan Free activado"
   ↓
5. Redirect a WhatsApp o Chat
```

**Tiempo estimado**: 30 segundos

### **⭐ Plan Plus (Con Pago)**

```
1. Landing Page
   ↓
2. Click "Plan Plus - $19.99/mes"
   ↓
3. Formulario de Registro
   - Email
   - Nombre
   - WhatsApp
   ↓
4. Página de Pago (MercadoPago)
   - Resumen del plan
   - Datos de facturación
   - Método de pago
   ↓
5. [Procesando Pago]
   ↓
6. Confirmación
   "¡Pago exitoso! Plan Plus activado"
   ↓
7. Redirect a WhatsApp o Chat
```

**Tiempo estimado**: 2-3 minutos

## 🎨 Diseño de Pantallas

### **1. Landing Page**

```
┌─────────────────────────────────────────┐
│         🤖 Zecubot                      │
│   Tu asistente inteligente WhatsApp    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Plan Free 🆓 │  │ Plan Plus ⭐ │   │
│  │              │  │              │   │
│  │ $0/mes       │  │ $19.99/mes   │   │
│  │ 10 msgs/día  │  │ 500 msgs/día │   │
│  │              │  │ IA Avanzada  │   │
│  │ [Comenzar]   │  │ [Suscribir]  │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### **2. Formulario de Registro**

```
┌─────────────────────────────────────────┐
│  Regístrate en Zecubot                  │
│  Plan seleccionado: [Free/Plus]         │
├─────────────────────────────────────────┤
│                                         │
│  📧 Email *                             │
│  [usuario@ejemplo.com]                  │
│                                         │
│  👤 Nombre *                            │
│  [Tu nombre]                            │
│                                         │
│  📱 WhatsApp * (con código de país)     │
│  [+54 9 11 1234-5678]                   │
│                                         │
│  ☐ Acepto términos y condiciones       │
│                                         │
│  [Continuar →]                          │
│                                         │
│  ¿Ya tienes cuenta? [Iniciar sesión]   │
└─────────────────────────────────────────┘
```

### **3. Página de Pago (Solo Plan Plus)**

```
┌─────────────────────────────────────────┐
│  Completa tu suscripción                │
├─────────────────────────────────────────┤
│  📦 Resumen:                            │
│  Plan Plus                       $19.99 │
│  Suscripción mensual                    │
│  ────────────────────────────────       │
│  Total:                          $19.99 │
│                                         │
│  💳 Método de Pago:                     │
│  [MercadoPago Button]                   │
│  - Tarjeta de crédito/débito            │
│  - Transferencia bancaria               │
│  - Otros métodos                        │
│                                         │
│  🔒 Pago 100% seguro                    │
└─────────────────────────────────────────┘
```

### **4. Confirmación**

```
┌─────────────────────────────────────────┐
│  ✅ ¡Todo listo!                        │
├─────────────────────────────────────────┤
│                                         │
│  Tu plan [Free/Plus] está activado      │
│                                         │
│  📱 Próximos pasos:                     │
│  1. Guarda este número: +XX XXX XXX     │
│  2. Envía "Hola" por WhatsApp           │
│  3. ¡Comienza a chatear!                │
│                                         │
│  [Abrir WhatsApp →]                     │
│  [Ir al Dashboard]                      │
│                                         │
└─────────────────────────────────────────┘
```

## 🔄 Flujo Alternativo (Opción B)

```
Landing → Registro → Login → Elegir Plan → [Si Plus] Pago → Activación
```

### **Ventajas:**
- Usuario registrado antes de elegir plan
- Puede cambiar de plan fácilmente
- Mejor para analytics

### **Desventajas:**
- Más pasos (mayor fricción)
- Algunos abandonan antes de elegir plan

## 🔐 Login vs Registro

### **¿Cuándo mostrar Login?**

**Opción Recomendada**: Login en la navbar, disponible siempre
```
┌─────────────────────────────────────────┐
│ 🤖 Zecubot    Planes    Ayuda  [Login] │
└─────────────────────────────────────────┘
```

**Login Modal:**
```
┌─────────────────────────────────────────┐
│  Iniciar Sesión                         │
├─────────────────────────────────────────┤
│  📧 Email o WhatsApp                    │
│  [tu-email@ejemplo.com]                 │
│                                         │
│  🔑 Código (enviado por email/SMS)      │
│  [000000]                               │
│                                         │
│  [Enviar código]  [Iniciar sesión]     │
│                                         │
│  ¿No tienes cuenta? [Registrarse]      │
└─────────────────────────────────────────┘
```

## 💡 Métodos de Autenticación

### **Opción 1: Magic Link (Recomendada)**
```
Usuario ingresa email → Enviar link → Click en email → Autenticado
```
**Ventajas**: Sin contraseña, seguro, simple

### **Opción 2: OTP (One-Time Password)**
```
Usuario ingresa email/WhatsApp → Enviar código → Ingresar código → Autenticado
```
**Ventajas**: Verifica WhatsApp, rápido

### **Opción 3: Contraseña tradicional**
```
Usuario ingresa email + contraseña → Autenticado
```
**Ventajas**: Familiar, no requiere acceso a email/SMS

## 🎯 Flujo Completo Recomendado

### **Para Plan Free:**

```javascript
// Pseudo-código del flujo
1. Usuario en Landing → Click "Comenzar Gratis"
2. Formulario registro simple
3. POST /api/auth/register
   {
     email: "user@example.com",
     name: "User Name",
     whatsappNumber: "+1234567890",
     selectedPlan: "free"
   }
4. Response: { userId, token, plan: "free" }
5. Redirect a /onboarding/welcome
6. Mostrar instrucciones WhatsApp
7. Guardar token en localStorage
8. Usuario listo para usar
```

### **Para Plan Plus:**

```javascript
// Pseudo-código del flujo
1. Usuario en Landing → Click "Plan Plus $19.99"
2. Formulario registro simple
3. POST /api/auth/register
   {
     email: "user@example.com",
     name: "User Name",
     whatsappNumber: "+1234567890",
     selectedPlan: "plus"
   }
4. Response: { userId, token, plan: "plus", paymentRequired: true }
5. Redirect a /payment/checkout
6. Mostrar MercadoPago button con userId
7. Usuario completa pago en MercadoPago
8. Webhook activa suscripción
9. Redirect a /onboarding/success
10. Mostrar instrucciones WhatsApp
11. Usuario listo para usar
```

## 📱 Integración con WhatsApp

### **Después del Registro/Pago:**

```
┌─────────────────────────────────────────┐
│  🎉 ¡Listo para comenzar!               │
├─────────────────────────────────────────┤
│  Para activar tu cuenta:                │
│                                         │
│  1️⃣ Haz click aquí:                     │
│     [Abrir WhatsApp] ← Link directo     │
│     wa.me/NUMERO?text=Hola%20Zecubot    │
│                                         │
│  2️⃣ O guarda este número:               │
│     +XX XXX XXX XXX                     │
│                                         │
│  3️⃣ Envía el mensaje:                   │
│     "Hola, soy [email@ejemplo.com]"     │
│                                         │
│  ✨ Tu plan [Free/Plus] se activará     │
│     automáticamente                     │
└─────────────────────────────────────────┘
```

## 🔄 Estados de Usuario

```javascript
// Estados posibles
const USER_STATES = {
  NEW: 'new',                    // Recién registrado
  REGISTERED: 'registered',       // Cuenta creada
  PAYMENT_PENDING: 'payment_pending', // Esperando pago
  ACTIVE: 'active',              // Plan activo
  EXPIRED: 'expired',            // Suscripción expirada
  CANCELLED: 'cancelled'         // Cuenta cancelada
}
```

## 🎨 Wireframes de Implementación

### **Archivo:** `app/onboarding/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'plus' | null>(null)
  const router = useRouter()

  // Step 1: Elegir Plan
  if (step === 1) {
    return <PlanSelection onSelect={(plan) => {
      setSelectedPlan(plan)
      setStep(2)
    }} />
  }

  // Step 2: Registro
  if (step === 2) {
    return <RegistrationForm 
      selectedPlan={selectedPlan}
      onSuccess={(user) => {
        if (selectedPlan === 'plus') {
          router.push('/payment/checkout')
        } else {
          router.push('/onboarding/welcome')
        }
      }}
    />
  }
}
```

## 📊 Métricas de Conversión

### **Puntos de Medición:**
1. Landing page views
2. Plan selection clicks
3. Registration started
4. Registration completed
5. Payment initiated (Plus)
6. Payment completed (Plus)
7. WhatsApp connected
8. First message sent

### **Objetivos:**
- Landing → Registration: >30%
- Registration → Payment: >70% (Plus)
- Payment → Activation: >90%
- Activation → First Message: >80%

## 🚀 Implementación Sugerida

### **Prioridad Alta (MVP):**
1. ✅ Landing page con selección de planes
2. ✅ Formulario de registro
3. ✅ Integración MercadoPago para Plus
4. ✅ Página de confirmación
5. ✅ Link directo a WhatsApp

### **Prioridad Media:**
1. 🔄 Login con Magic Link
2. 🔄 Dashboard de usuario
3. 🔄 Gestión de suscripción
4. 🔄 Emails de bienvenida

### **Prioridad Baja:**
1. 📋 Cambio de plan
2. 📋 Facturación
3. 📋 Historial de pagos

## 💡 Recomendación Final

**Flujo Óptimo para Zecubot:**

```
1. Landing → "Comenzar Gratis" o "Plan Plus"
2. Registro simple (email + nombre + WhatsApp)
3. [Si Plus] → MercadoPago → Pago
4. Confirmación + Link WhatsApp directo
5. Usuario comienza a chatear
```

**Razones:**
- ✅ Mínima fricción
- ✅ Conversión rápida para Free
- ✅ Pago solo cuando necesario
- ✅ Activación inmediata
- ✅ No requiere login complejo inicial

---

**¿Quieres que implemente este flujo con los componentes de UI?**
