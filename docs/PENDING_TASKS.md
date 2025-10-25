# 📋 Tareas Pendientes - Zecubot

## 🚀 **Prioridad Alta**

### 1. **OTP por WhatsApp en Producción**

**Estado:** Pendiente  
**Estimación:** 2-3 horas  
**Dependencias:** n8n, Twilio

**Pasos:**
- [ ] Configurar cuenta Twilio (o servicio alternativo)
- [ ] Crear workflow en n8n para envío de WhatsApp
- [ ] Configurar webhook endpoint en n8n
- [ ] Actualizar `N8N_WEBHOOK_SEND_OTP_URL` en variables de entorno
- [ ] Probar envío real de OTP
- [ ] Documentar flujo completo

**Archivos a modificar:**
- `.env.local` - Agregar URL de webhook n8n
- Ningún archivo de código (ya está implementado)

**Recursos:**
- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [n8n Twilio Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twilio/)

---

### 2. **Sistema de Contabilización de Consultas**

**Estado:** Pendiente  
**Estimación:** 4-5 horas  
**Dependencias:** Supabase, n8n

**Pasos:**
- [ ] Crear tabla `user_queries` en Supabase
  \`\`\`sql
  CREATE TABLE user_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone VARCHAR(20) NOT NULL,
    query_type VARCHAR(50), -- 'message_analysis', 'image_analysis', etc
    timestamp TIMESTAMP DEFAULT NOW(),
    month_year VARCHAR(7), -- 'YYYY-MM' para agrupar
    FOREIGN KEY (user_phone) REFERENCES users(phone)
  );
  
  CREATE INDEX idx_user_queries_phone_month ON user_queries(user_phone, month_year);
  \`\`\`

- [ ] Crear función para contar consultas del mes
  \`\`\`sql
  CREATE OR REPLACE FUNCTION get_monthly_query_count(p_phone VARCHAR)
  RETURNS INT AS $$
  BEGIN
    RETURN (
      SELECT COUNT(*)
      FROM user_queries
      WHERE user_phone = p_phone
      AND month_year = TO_CHAR(NOW(), 'YYYY-MM')
    );
  END;
  $$ LANGUAGE plpgsql;
  \`\`\`

- [ ] API endpoint `/api/queries/check-limit`
- [ ] Implementar lógica en n8n para:
  - Verificar límite antes de procesar consulta
  - Incrementar contador después de procesar
  - Enviar mensaje cuando se alcanza límite

- [ ] UI en dashboard para mostrar:
  - Consultas utilizadas este mes
  - Consultas restantes
  - Fecha de reset (próximo mes)

**Límites por Plan:**
- **Free:** 5 consultas/mes
- **Plus:** 50 consultas/mes

**Archivos a crear/modificar:**
- `supabase/migrations/004_create_user_queries_table.sql`
- `app/api/queries/check-limit/route.ts`
- `app/api/queries/increment/route.ts`
- `app/dashboard/page.tsx` - Mostrar estadísticas
- Workflow n8n - Agregar nodos de verificación

---

### 3. **Funcionalidad de Baja de Plan**

**Estado:** Pendiente  
**Estimación:** 3-4 horas  
**Dependencias:** Mercado Pago API

**Pasos:**
- [ ] Investigar API de Mercado Pago para cancelar suscripciones
- [ ] API endpoint `/api/subscription/cancel`
- [ ] UI en dashboard con botón "Cancelar suscripción"
- [ ] Modal de confirmación
- [ ] Lógica para:
  - Cancelar en Mercado Pago
  - Actualizar plan en DB a 'free'
  - Mantener acceso hasta fecha de expiración
  - Enviar email de confirmación (opcional)

**Flujo:**
1. Usuario hace clic en "Cancelar suscripción"
2. Modal: "¿Estás seguro? Mantendrás acceso hasta [fecha]"
3. Confirma → Cancela en MP → Actualiza DB
4. No se renueva automáticamente
5. Al expirar → Downgrade a Free

**Archivos a crear/modificar:**
- `app/api/subscription/cancel/route.ts`
- `app/dashboard/page.tsx` - Agregar botón/modal
- `components/cancel-subscription-modal.tsx`
- `lib/mercadopago.ts` - Función para cancelar

**Documentación:**
- [Mercado Pago - Cancelar suscripción](https://www.mercadopago.com.ar/developers/es/reference/subscriptions/_preapproval_id/put)

---

## 🎨 **Prioridad Media**

### 4. **Refinar Prompt del Bot**

**Estado:** Pendiente  
**Estimación:** 2-3 horas  
**Dependencias:** Ninguna

**Objetivos:**
- [ ] Mejorar detección de patrones de estafa argentinos
- [ ] Agregar ejemplos de mensajes legítimos vs estafas
- [ ] Respuestas más claras y accionables
- [ ] Tono amigable pero serio

**Casos de Uso Específicos:**
- Phishing de bancos argentinos (Galicia, Santander, BBVA, etc.)
- Estafas de ANSES/AFIP
- Delivery falso (Rappi, PedidosYa)
- Mercado Libre/Mercado Pago falsos
- Ofertas de trabajo fraudulentas

**Estructura del Prompt:**
1. **Contexto:** Eres experto en ciberseguridad argentino
2. **Tarea:** Analizar mensaje y determinar nivel de riesgo
3. **Criterios:** Patrones comunes de estafas
4. **Formato de respuesta:**
   - Nivel de riesgo: BAJO/MEDIO/ALTO
   - Explicación clara
   - Pasos a seguir (si es riesgoso)
   - Qué hacer si ya compartiste datos

**Archivo:**
- Workflow n8n - Nodo de prompt AI

---

### 5. **Optimizar Flujo Conversacional**

**Estado:** Pendiente  
**Estimación:** 3-4 horas  
**Dependencias:** n8n

**Mejoras:**
- [ ] Menú principal con opciones
- [ ] Manejo de contexto/historial
- [ ] Respuestas rápidas (quick replies)
- [ ] Soporte para imágenes/screenshots
- [ ] Audio de llamadas sospechosas

**Flujo Propuesto:**
\`\`\`
Usuario: Hola
Bot: 👋 ¡Hola! Soy Zecu, tu asistente contra estafas.

Puedo ayudarte con:
1️⃣ Analizar un mensaje sospechoso
2️⃣ Verificar un link
3️⃣ Qué hacer si ya compartiste datos
4️⃣ Reportar una estafa

Responde con el número o envía directamente el mensaje.
\`\`\`

**Archivo:**
- Workflow n8n - Reestructurar flujo

---

## 🔧 **Prioridad Baja (Pre-Producción)**

### 6. **Configurar Webhook de Producción**

**Estado:** Pendiente  
**Estimación:** 1 hora  
**Dependencias:** Dominio/Vercel

**Opciones:**
1. **Vercel (Recomendado):**
   - Deploy automático desde GitHub
   - URL: `https://zecu.vercel.app/api/webhooks/mercadopago`

2. **Dominio Custom:**
   - `https://zecubot.com/api/webhooks/mercadopago`

3. **Ngrok (Testing):**
   - Solo para pruebas locales

**Pasos:**
- [ ] Deploy a Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Configurar webhook en Mercado Pago con URL pública
- [ ] Probar webhook con pago real de $1

---

### 7. **Credenciales de Producción**

**Estado:** Pendiente  
**Estimación:** 30 minutos  
**Dependencias:** Cuenta Mercado Pago verificada

**Pasos:**
- [ ] Verificar cuenta de Mercado Pago (datos fiscales)
- [ ] Obtener credenciales de producción (`APP_USR-xxx`)
- [ ] Actualizar `.env.local` o variables de Vercel
- [ ] Cambiar `NEXT_PUBLIC_BASE_URL` a dominio real
- [ ] Verificar que no haya credenciales TEST en producción

**Archivo:**
- `.env.local` → Vercel Environment Variables

---

### 8. **Testing de Producción**

**Estado:** Pendiente  
**Estimación:** 1-2 horas  
**Dependencias:** Todo lo anterior

**Checklist:**
- [ ] Pago real con tarjeta propia ($1 o monto mínimo)
- [ ] Verificar que webhook se recibe
- [ ] Plan se actualiza correctamente
- [ ] Dashboard muestra Plan Plus
- [ ] Fecha de expiración correcta
- [ ] OTP llega por WhatsApp
- [ ] Bot de WhatsApp funciona
- [ ] Contador de consultas funciona
- [ ] Cancelación de suscripción funciona

---

## 📊 **Progreso General**

| Categoría | Completado | Pendiente | Total |
|-----------|------------|-----------|-------|
| 🔐 Autenticación | 90% | 10% | 100% |
| 💳 Pagos | 70% | 30% | 100% |
| 🤖 Bot WhatsApp | 30% | 70% | 100% |
| 📊 Dashboard | 80% | 20% | 100% |
| 🚀 Producción | 0% | 100% | 100% |

**Total General:** ~54% completado

---

## 🎯 **Orden Recomendado de Implementación:**

1. **OTP en Producción** (crítico para lanzamiento)
2. **Sistema de Contabilización** (core del negocio)
3. **Refinar Prompt del Bot** (calidad del servicio)
4. **Optimizar Flujo Conversacional** (UX)
5. **Baja de Plan** (retención de usuarios)
6. **Configuración de Producción** (lanzamiento)

---

**Última actualización:** 21 Octubre 2025  
**Próxima sesión recomendada:** OTP en Producción
