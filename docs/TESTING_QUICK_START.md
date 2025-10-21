# 🚀 Testing Quick Start

## Setup en 2 minutos

### 1. Iniciar servidor
```bash
npm run dev
```

### 2. Abrir herramientas
- **Navegador**: http://localhost:3000
- **DevTools**: F12 (Console + Application)
- **Terminal**: Ver logs del servidor

---

## 🧪 Test rápido (5 minutos)

### Flujo básico: Usuario nuevo → Plan Free

1. **Login**
   ```
   http://localhost:3000/login
   ```

2. **Teléfono**
   - País: `+54`
   - Número: `1112345678`
   - Click "Enviar código"

3. **OTP**
   - **Terminal del servidor:**
     ```
     📱 [DESARROLLO] Código OTP para +541112345678: 123456
     ```
   - Copiar código → Pegar en la web → "Verificar"

4. **Perfil**
   - Nombre: "Test"
   - País: "Argentina"
   - Ciudad: "Buenos Aires"
   - "Continuar"

5. **Plan**
   - Click "Comenzar gratis"

6. **Verificar**
   - URL: `/welcome` ✅
   - Nombre: "Test" ✅
   - Plan: "Free" ✅

---

## 🛠️ Comandos útiles

### Script interactivo de testing
```bash
npm run test:flows
```

### Verificar sesión (en console del navegador)
```javascript
fetch('/api/auth/check-session')
  .then(r => r.json())
  .then(console.log)
```

### Limpiar sesión
```javascript
sessionStorage.clear()
document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
location.reload()
```

### Ver pendingPurchase
```javascript
JSON.parse(sessionStorage.getItem('pendingPurchase'))
```

---

## 📊 Queries SQL (Supabase)

### Ver usuarios recientes
```sql
SELECT phone, name, plan, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Limpiar usuario de prueba
```sql
DELETE FROM users WHERE phone = '+541112345678';
DELETE FROM otp_codes WHERE phone = '+541112345678';
```

---

## 🐛 Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| No veo código OTP | Verifica que `N8N_WEBHOOK_SEND_OTP_URL` esté vacío |
| "No autenticado" | Verifica cookie `session_token` en DevTools |
| Webhook no funciona | Simula manualmente (ver abajo) |
| Usuario ya existe | Usa otro teléfono o borra con SQL |

### Simular webhook
```bash
curl http://localhost:3000/api/webhooks/mercadopago \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":PAYMENT_ID}}'
```

---

## 📚 Documentación completa

- **Guía detallada**: `docs/TESTING_FLOWS_GUIDE.md`
- **Setup de Supabase**: `docs/ENVIRONMENT_VARIABLES.md`

---

**Happy Testing! 🎉**


