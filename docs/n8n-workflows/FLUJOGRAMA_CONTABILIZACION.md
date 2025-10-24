# 🔄 Flujograma Completo del Sistema de Contabilización

## 📊 Diagrama Principal

\`\`\`mermaid
flowchart TD
    Start([👤 Usuario envía mensaje<br/>por WhatsApp]) --> Twilio[📱 Twilio Trigger<br/>Recibe mensaje]
    
    Twilio --> CodeJS[⚙️ Code in JavaScript<br/>Limpia 'whatsapp:']
    
    CodeJS --> Extract[🔍 data_extraction<br/>Extrae: from, body, etc.]
    
    Extract --> GetRow[🗄️ Get a row<br/>Buscar usuario en Supabase<br/>por phone]
    
    GetRow --> Validar[🔍 Validar Límite<br/>POST /api/consultas/validar<br/>userId]
    
    Validar --> Decision{🤔 ¿Puede<br/>Consultar?}
    
    Decision -->|❌ NO<br/>Límite alcanzado| MensajeLimite[📵 Enviar Límite Alcanzado<br/>Twilio WhatsApp]
    
    MensajeLimite --> End1([🔴 FIN])
    
    Decision -->|✅ SÍ<br/>Tiene consultas disponibles| Registrar[📝 Registrar Consulta<br/>POST /api/consultas/registrar<br/>userId, mensaje, tipo]
    
    Registrar --> SwitchPlan{🎯 Plan<br/>Switch}
    
    SwitchPlan -->|FREE| ClassifierFree[🤖 Text Classifier<br/>Saludo o consulta]
    
    ClassifierFree --> BotFree[💬 Bot Saludo<br/>Respuesta básica]
    
    BotFree --> SendFree[📤 Send Message<br/>Twilio]
    
    SendFree --> End2([🟢 FIN])
    
    SwitchPlan -->|PLUS/PREMIUM| SwitchMedia{📎 Switch3<br/>¿Es multimedia?}
    
    SwitchMedia -->|Texto| ClassifierPlus[🤖 Text Classifier1<br/>Saludo o consulta]
    
    ClassifierPlus -->|Saludo| BotPlus[💬 Bot Saludo1<br/>Respuesta básica]
    
    BotPlus --> SendPlus[📤 Send Message1<br/>Twilio]
    
    SendPlus --> End3([🟢 FIN])
    
    ClassifierPlus -->|Consulta| CamposTexto[📋 Campos_texto1<br/>Preparar datos]
    
    SwitchMedia -->|Multimedia| CamposTexto
    
    CamposTexto --> Buffer[🖼️ Buffer1<br/>Procesar multimedia]
    
    Buffer --> GetBuffer[📥 Get Buffer1<br/>Obtener contenido]
    
    GetBuffer --> Switch5[⏰ Switch5<br/>Timing]
    
    Switch5 --> Redis[💾 Redis1<br/>Cache]
    
    Redis --> EditFields[✏️ Edit Fields1<br/>Formatear datos]
    
    EditFields --> SendAnalyzing[📨 Send SMS<br/>'Estoy analizando...']
    
    SendAnalyzing --> AIAgent[🤖 AI Agent1<br/>Análisis con IA<br/>OpenAI GPT-4]
    
    AIAgent --> Actualizar[💾 Actualizar Consulta<br/>POST /api/consultas/actualizar<br/>consultaId, respuesta,<br/>riesgo_detectado, nivel_riesgo]
    
    Actualizar --> SendRespuesta[📤 Send WhatsApp<br/>Respuesta del análisis]
    
    SendRespuesta --> End4([🟢 FIN])
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style Validar fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Registrar fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Actualizar fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Decision fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style AIAgent fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style MensajeLimite fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style End1 fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End3 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End4 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
\`\`\`

---

## 🎯 Diagrama Simplificado (Solo Contabilización)

\`\`\`mermaid
flowchart TD
    Start([📱 Mensaje recibido]) --> Extract[🔍 Extraer datos]
    
    Extract --> GetUser[🗄️ Obtener user_id<br/>de Supabase]
    
    GetUser --> Validar[🔍 Validar Límite<br/>POST /api/consultas/validar]
    
    Validar --> Check{¿Puede<br/>consultar?}
    
    Check -->|❌ NO| Rechazar[📵 Mensaje:<br/>'Límite alcanzado']
    Rechazar --> FinNO([FIN])
    
    Check -->|✅ SÍ| Registrar[📝 Registrar Consulta<br/>POST /api/consultas/registrar]
    
    Registrar --> Procesar[⚙️ Procesar consulta<br/>con IA]
    
    Procesar --> Actualizar[💾 Actualizar Consulta<br/>POST /api/consultas/actualizar]
    
    Actualizar --> Responder[📤 Enviar respuesta<br/>al usuario]
    
    Responder --> FinSI([✅ FIN])
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Validar fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Registrar fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Actualizar fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Check fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Rechazar fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
\`\`\`

---

## 🔄 Diagrama de Secuencia (Interacción entre Componentes)

\`\`\`mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant W as 📱 WhatsApp/Twilio
    participant N as 🔧 n8n Workflow
    participant API as 🖥️ Next.js API
    participant DB as 🗄️ Supabase
    participant AI as 🤖 OpenAI

    U->>W: Envía mensaje
    W->>N: Trigger webhook
    N->>N: Extraer datos (phone, mensaje)
    N->>DB: Buscar user_id por phone
    DB-->>N: user_id
    
    rect rgb(200, 220, 255)
        Note over N,API: 🔵 Sistema de Contabilización
        N->>API: POST /api/consultas/validar<br/>{userId}
        API->>DB: CALL puede_realizar_consulta(user_id)
        DB-->>API: {puede_consultar, plan, limite}
        API-->>N: Resultado validación
    end
    
    alt ❌ Límite alcanzado
        N->>W: Mensaje: "Límite alcanzado"
        W->>U: Notificación límite
    else ✅ Puede consultar
        rect rgb(200, 255, 220)
            Note over N,API: 🟢 Registrar Consulta
            N->>API: POST /api/consultas/registrar<br/>{userId, mensaje, tipo}
            API->>DB: INSERT INTO consultas
            DB-->>API: consultaId
            API-->>N: {consultaId}
        end
        
        N->>W: "Estoy analizando..."
        W->>U: Mensaje de espera
        
        N->>AI: Analizar mensaje
        AI-->>N: Respuesta + análisis riesgo
        
        rect rgb(255, 230, 200)
            Note over N,API: 🟠 Actualizar Consulta
            N->>API: POST /api/consultas/actualizar<br/>{consultaId, respuesta, riesgo}
            API->>DB: UPDATE consultas
            DB-->>API: OK
        end
        
        N->>W: Enviar respuesta
        W->>U: Respuesta del análisis
    end
\`\`\`

---

## 📊 Diagrama de Estados del Usuario

\`\`\`mermaid
stateDiagram-v2
    [*] --> Recibido: Mensaje llega
    
    Recibido --> ValidandoLimite: Extraer datos
    
    ValidandoLimite --> LimiteAlcanzado: consultas_usadas >= limite
    ValidandoLimite --> ConsultaPermitida: consultas_usadas < limite
    
    LimiteAlcanzado --> Notificado: Enviar mensaje límite
    Notificado --> [*]
    
    ConsultaPermitida --> Registrando: Registrar en BD
    Registrando --> Procesando: Enviar a IA
    Procesando --> Actualizando: Recibir respuesta
    Actualizando --> Respondiendo: Actualizar BD
    Respondiendo --> Completado: Enviar al usuario
    Completado --> [*]
    
    note right of ValidandoLimite
        API: /api/consultas/validar
        Función: puede_realizar_consulta()
    end note
    
    note right of Registrando
        API: /api/consultas/registrar
        Tabla: consultas
    end note
    
    note right of Actualizando
        API: /api/consultas/actualizar
        Campos: respuesta, riesgo_detectado
    end note
\`\`\`

---

## 🗄️ Diagrama de Base de Datos

\`\`\`mermaid
erDiagram
    users ||--o{ consultas : tiene
    
    users {
        uuid id PK
        varchar phone UK
        varchar name
        varchar plan
        timestamp created_at
    }
    
    consultas {
        uuid id PK
        uuid user_id FK
        text mensaje
        text respuesta
        varchar tipo
        boolean riesgo_detectado
        varchar nivel_riesgo
        timestamp created_at
        varchar mes_periodo
    }
    
    users ||--o{ consultas_por_mes : "tiene vista"
    
    consultas_por_mes {
        uuid user_id
        varchar mes_periodo
        int total_consultas
    }
\`\`\`

---

## 🔧 Diagrama de Arquitectura

\`\`\`mermaid
graph TB
    subgraph "🌐 Cliente"
        User[👤 Usuario]
        WhatsApp[📱 WhatsApp]
    end
    
    subgraph "☁️ Servicios Externos"
        Twilio[📞 Twilio API]
        OpenAI[🤖 OpenAI GPT-4]
    end
    
    subgraph "🔧 Automatización"
        N8N[⚙️ n8n Workflow]
    end
    
    subgraph "🖥️ Backend - Next.js"
        API1[📍 /api/consultas/validar]
        API2[📍 /api/consultas/registrar]
        API3[📍 /api/consultas/actualizar]
        ClientLib[📦 consultas-client.ts]
    end
    
    subgraph "🗄️ Base de Datos - Supabase"
        UsersTable[(👥 users)]
        ConsultasTable[(📊 consultas)]
        MatView[(📈 consultas_por_mes)]
        Func1[⚙️ puede_realizar_consulta]
        Func2[⚙️ get_consultas_mes_actual]
    end
    
    User <-->|Mensajes| WhatsApp
    WhatsApp <-->|SMS/WhatsApp| Twilio
    Twilio -->|Webhook| N8N
    
    N8N -->|HTTP POST| API1
    N8N -->|HTTP POST| API2
    N8N -->|Prompt| OpenAI
    OpenAI -->|Respuesta| N8N
    N8N -->|HTTP POST| API3
    N8N -->|Enviar respuesta| Twilio
    
    API1 --> ClientLib
    API2 --> ClientLib
    API3 --> ClientLib
    
    ClientLib --> UsersTable
    ClientLib --> ConsultasTable
    ClientLib --> Func1
    ClientLib --> Func2
    
    ConsultasTable -.->|Materializa| MatView
    Func1 -.->|Lee| MatView
    Func2 -.->|Lee| MatView
    
    style User fill:#4CAF50,stroke:#2E7D32,color:#fff
    style WhatsApp fill:#25D366,stroke:#128C7E,color:#fff
    style N8N fill:#EA4B71,stroke:#C62828,color:#fff
    style OpenAI fill:#10A37F,stroke:#0A7357,color:#fff
    style API1 fill:#2196F3,stroke:#1565C0,color:#fff
    style API2 fill:#2196F3,stroke:#1565C0,color:#fff
    style API3 fill:#2196F3,stroke:#1565C0,color:#fff
    style ConsultasTable fill:#FF9800,stroke:#E65100,color:#fff
\`\`\`

---

## 📈 Flujo de Decisión por Plan

\`\`\`mermaid
flowchart LR
    Start([Usuario envía consulta]) --> Plan{Plan del<br/>usuario}
    
    Plan -->|FREE| CheckFree{Consultas<br/>< 5?}
    Plan -->|PLUS| CheckPlus{Consultas<br/>< 50?}
    Plan -->|PREMIUM| CheckPremium{Consultas<br/>< 100?}
    
    CheckFree -->|❌ NO| Block1[❌ Bloqueado]
    CheckFree -->|✅ SÍ| ProcessFree[🤖 Análisis básico]
    
    CheckPlus -->|❌ NO| Block2[❌ Bloqueado]
    CheckPlus -->|✅ SÍ| ProcessPlus[🤖 Análisis avanzado<br/>+ Multimedia]
    
    CheckPremium -->|❌ NO| Block3[❌ Bloqueado]
    CheckPremium -->|✅ SÍ| ProcessPremium[🤖 Análisis premium<br/>+ Multimedia<br/>+ Prioridad]
    
    Block1 --> Upgrade1[💎 Ofrecer upgrade]
    Block2 --> Upgrade2[💎 Ofrecer upgrade]
    Block3 --> Upgrade3[💎 Ofrecer upgrade]
    
    ProcessFree --> Count1[+1 consulta FREE]
    ProcessPlus --> Count2[+1 consulta PLUS]
    ProcessPremium --> Count3[+1 consulta PREMIUM]
    
    Count1 --> Response[📤 Respuesta]
    Count2 --> Response
    Count3 --> Response
    
    style CheckFree fill:#FFC107,stroke:#F57C00,color:#000
    style CheckPlus fill:#2196F3,stroke:#1565C0,color:#fff
    style CheckPremium fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style Block1 fill:#F44336,stroke:#C62828,color:#fff
    style Block2 fill:#F44336,stroke:#C62828,color:#fff
    style Block3 fill:#F44336,stroke:#C62828,color:#fff
    style Response fill:#4CAF50,stroke:#2E7D32,color:#fff
\`\`\`

---

## 🎨 Leyenda de Colores

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Inicio, Éxito, Finalización correcta |
| 🔵 Azul | APIs, Operaciones de contabilización |
| 🟣 Morado | IA, Procesamiento inteligente |
| 🟠 Naranja | Decisiones, Condicionales |
| 🔴 Rojo | Errores, Bloqueos, Límites alcanzados |

---

## 📱 Ejemplo de Flujo Real

### Caso 1: Usuario FREE con 3 consultas usadas ✅

\`\`\`
Usuario: "¿Es legítimo este email?"
   ↓
Twilio recibe → n8n extrae datos
   ↓
GET user_id: abc-123 (plan: free)
   ↓
POST /api/consultas/validar {userId: "abc-123"}
   ↓
Respuesta: {puede_consultar: true, consultas_usadas: 3, limite: 5}
   ↓
POST /api/consultas/registrar {userId: "abc-123", mensaje: "¿Es legítimo..."}
   ↓
OpenAI analiza → Respuesta: "🛡️ BAJO RIESGO..."
   ↓
POST /api/consultas/actualizar {consultaId: "xyz", respuesta: "...", riesgo: false}
   ↓
WhatsApp envía respuesta al usuario
   ↓
✅ Completado (ahora tiene 4/5 consultas)
\`\`\`

### Caso 2: Usuario FREE con 5 consultas usadas ❌

\`\`\`
Usuario: "Analiza este link"
   ↓
Twilio recibe → n8n extrae datos
   ↓
GET user_id: abc-123 (plan: free)
   ↓
POST /api/consultas/validar {userId: "abc-123"}
   ↓
Respuesta: {puede_consultar: false, consultas_usadas: 5, limite: 5}
   ↓
WhatsApp envía: "🚫 Límite alcanzado. Actualiza a PLUS..."
   ↓
❌ Bloqueado (no se registra la consulta)
\`\`\`

---

## 🔍 Cómo Leer los Diagramas

### Símbolos Principales:

- **Rectángulo** → Proceso o acción
- **Rombo** → Decisión (if/else)
- **Cilindro** → Base de datos
- **Círculo** → Inicio o fin
- **Flecha** → Flujo de ejecución

### Líneas:

- **Línea sólida (→)** → Flujo principal
- **Línea punteada (-.->)** → Dependencia o relación

---

## 📥 Exportar Diagramas

Puedes ver estos diagramas en:

1. **GitHub** → Se renderizan automáticamente
2. **VS Code** → Extensión "Markdown Preview Mermaid Support"
3. **Mermaid Live Editor** → https://mermaid.live/
4. **Notion, Confluence, etc.** → Soporte nativo para Mermaid

Para exportar como imagen:
1. Copia el código del diagrama
2. Ve a https://mermaid.live/
3. Pega el código
4. Click en "Export" → PNG/SVG

---

## 🎯 Próximos Pasos

Con estos diagramas puedes:

1. ✅ Entender el flujo completo visualmente
2. ✅ Identificar dónde hacer correcciones en n8n
3. ✅ Explicar el sistema a otros desarrolladores
4. ✅ Documentar la arquitectura

**¿Listo para aplicar las correcciones en n8n?** 🚀
