# 🔄 Flujo de N8N - Switch de Planes (Free/Plus)

## 📋 Descripción del Flujo

Este flujo de N8N determina automáticamente qué plan tiene el usuario (Free o Plus) y lo dirige a la conversación correspondiente. Si no hay datos del usuario, se le envía un mensaje para registrarse.

## 🏗️ Estructura del Flujo

```
Webhook Trigger
    ↓
HTTP Request (Consultar Usuario)
    ↓
Switch (Evaluar Plan)
    ├── Free Plan → Respuesta Free
    ├── Plus Plan → Respuesta Plus  
    └── No Data → Mensaje de Registro
```

## 🔧 Configuración de Nodos

### **1. Webhook Trigger**
```json
{
  "httpMethod": "POST",
  "path": "zecubot-plans",
  "responseMode": "responseNode"
}
```

### **2. HTTP Request - Consultar Usuario**
```json
{
  "method": "POST",
  "url": "https://pguikxzntrotsrqrzwuh.supabase.co/rest/v1/users",
  "headers": {
    "apikey": "{{$env.SUPABASE_ANON_KEY}}",
    "Authorization": "Bearer {{$env.SUPABASE_ANON_KEY}}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  "body": {
    "select": "id,email,plan_type,subscription_status,metadata",
    "or": [
      "email.eq.{{$json.email}}",
      "metadata->>whatsapp_number.eq.{{$json.whatsapp_number}}"
    ]
  }
}
```

### **3. Switch - Evaluar Plan**
```json
{
  "rules": [
    {
      "operation": "equal",
      "value1": "{{$json.length}}",
      "value2": "0",
      "output": 0
    },
    {
      "operation": "equal", 
      "value1": "{{$json[0].plan_type}}",
      "value2": "free",
      "output": 1
    },
    {
      "operation": "equal",
      "value1": "{{$json[0].plan_type}}", 
      "value2": "plus",
      "output": 2
    }
  ]
}
```

### **4. Respuesta Free Plan (Output 1)**
```json
{
  "response": {
    "message": "¡Hola! Tienes el Plan Gratuito de Zecubot 🆓\n\n✅ Características incluidas:\n• 10 mensajes por día\n• 3 conversaciones simultáneas\n• Respuestas básicas\n• Soporte comunitario\n\n💡 Para más funcionalidades, considera actualizar a Plan Plus: /upgrade",
    "plan_type": "free",
    "features": [
      "10 mensajes por día",
      "3 conversaciones simultáneas", 
      "Respuestas básicas",
      "Soporte comunitario"
    ],
    "upgrade_available": true
  }
}
```

### **5. Respuesta Plus Plan (Output 2)**
```json
{
  "response": {
    "message": "¡Hola! Tienes el Plan Plus de Zecubot ⭐\n\n🚀 Características incluidas:\n• 500 mensajes por día\n• 50 conversaciones simultáneas\n• Respuestas avanzadas con IA\n• Soporte prioritario 24/7\n• Análisis de enlaces\n• Historial de conversaciones\n\n¡Disfruta de todas las funcionalidades premium!",
    "plan_type": "plus",
    "features": [
      "500 mensajes por día",
      "50 conversaciones simultáneas",
      "Respuestas avanzadas con IA", 
      "Soporte prioritario 24/7",
      "Análisis de enlaces",
      "Historial de conversaciones"
    ],
    "upgrade_available": false
  }
}
```

### **6. Mensaje de Registro (Output 0)**
```json
{
  "response": {
    "message": "¡Hola! Bienvenido a Zecubot 🤖\n\nParece que no tienes una cuenta registrada. Para comenzar:\n\n1️⃣ Regístrate en: https://zecubot.com/register\n2️⃣ O envía tu email a: registro@zecubot.com\n3️⃣ Te activaremos el Plan Gratuito automáticamente\n\n¿Necesitas ayuda? Responde con /ayuda",
    "action_required": "registration",
    "registration_url": "https://zecubot.com/register",
    "support_email": "registro@zecubot.com"
  }
}
```

## 🔄 Flujo Completo JSON

```json
{
  "name": "Zecubot Plans Switch",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "zecubot-plans",
        "responseMode": "responseNode"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://pguikxzntrotsrqrzwuh.supabase.co/rest/v1/users",
        "headers": {
          "apikey": "{{$env.SUPABASE_ANON_KEY}}",
          "Authorization": "Bearer {{$env.SUPABASE_ANON_KEY}}",
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        "body": {
          "select": "id,email,plan_type,subscription_status,metadata",
          "or": [
            "email.eq.{{$json.email}}",
            "metadata->>whatsapp_number.eq.{{$json.whatsapp_number}}"
          ]
        }
      },
      "name": "Consultar Usuario",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "rules": {
          "rules": [
            {
              "operation": "equal",
              "value1": "{{$json.length}}",
              "value2": "0",
              "output": 0
            },
            {
              "operation": "equal",
              "value1": "{{$json[0].plan_type}}",
              "value2": "free",
              "output": 1
            },
            {
              "operation": "equal",
              "value1": "{{$json[0].plan_type}}",
              "value2": "plus", 
              "output": 2
            }
          ]
        }
      },
      "name": "Switch Plan",
      "type": "n8n-nodes-base.switch",
      "position": [680, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "message": "¡Hola! Tienes el Plan Gratuito de Zecubot 🆓\n\n✅ Características incluidas:\n• 10 mensajes por día\n• 3 conversaciones simultáneas\n• Respuestas básicas\n• Soporte comunitario\n\n💡 Para más funcionalidades, considera actualizar a Plan Plus: /upgrade",
          "plan_type": "free",
          "features": [
            "10 mensajes por día",
            "3 conversaciones simultáneas",
            "Respuestas básicas", 
            "Soporte comunitario"
          ],
          "upgrade_available": true
        }
      },
      "name": "Respuesta Free",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [900, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "message": "¡Hola! Tienes el Plan Plus de Zecubot ⭐\n\n🚀 Características incluidas:\n• 500 mensajes por día\n• 50 conversaciones simultáneas\n• Respuestas avanzadas con IA\n• Soporte prioritario 24/7\n• Análisis de enlaces\n• Historial de conversaciones\n\n¡Disfruta de todas las funcionalidades premium!",
          "plan_type": "plus",
          "features": [
            "500 mensajes por día",
            "50 conversaciones simultáneas",
            "Respuestas avanzadas con IA",
            "Soporte prioritario 24/7",
            "Análisis de enlaces",
            "Historial de conversaciones"
          ],
          "upgrade_available": false
        }
      },
      "name": "Respuesta Plus",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [900, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "message": "¡Hola! Bienvenido a Zecubot 🤖\n\nParece que no tienes una cuenta registrada. Para comenzar:\n\n1️⃣ Regístrate en: https://zecubot.com/register\n2️⃣ O envía tu email a: registro@zecubot.com\n3️⃣ Te activaremos el Plan Gratuito automáticamente\n\n¿Necesitas ayuda? Responde con /ayuda",
          "action_required": "registration",
          "registration_url": "https://zecubot.com/register",
          "support_email": "registro@zecubot.com"
        }
      },
      "name": "Mensaje Registro",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [900, 400]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Consultar Usuario",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Consultar Usuario": {
      "main": [
        [
          {
            "node": "Switch Plan",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Switch Plan": {
      "main": [
        [
          {
            "node": "Mensaje Registro",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Respuesta Free",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Respuesta Plus",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🧪 Testing del Flujo

### **Caso 1: Usuario Free**
```json
{
  "email": "usuario.free@test.com",
  "whatsapp_number": "+1234567890"
}
```

### **Caso 2: Usuario Plus**
```json
{
  "email": "usuario.plus@test.com", 
  "whatsapp_number": "+1234567891"
}
```

### **Caso 3: Usuario No Registrado**
```json
{
  "email": "nuevo@test.com",
  "whatsapp_number": "+1234567892"
}
```

## 🔧 Variables de Entorno Requeridas

```env
SUPABASE_ANON_KEY=tu_clave_anonima_supabase
N8N_WEBHOOK_URL=tu_webhook_url_n8n
```

## 📊 Monitoreo y Logs

- **Logs de consultas**: Verificar en Supabase Dashboard
- **Logs de N8N**: Revisar en N8N Execution History
- **Métricas**: Contar respuestas por tipo de plan
- **Errores**: Monitorear fallos en consultas a BD

## 🚀 Próximos Pasos

1. **Implementar en N8N**: Importar el flujo JSON
2. **Configurar webhook**: Establecer URL de webhook
3. **Testing**: Probar con diferentes tipos de usuario
4. **Monitoreo**: Configurar alertas de error
5. **Optimización**: Mejorar tiempos de respuesta
