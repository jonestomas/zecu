import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { getUserByPhone, createUser, updateUserPlan, createOTPCode } from '@/lib/supabase-client'

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Webhook received:", body)

    // Verificar que sea una notificación de pago
    if (body.type === "payment") {
      const paymentId = body.data.id

      try {
        // Obtener información completa del pago desde Mercado Pago
        const paymentInfo = await payment.get({ id: paymentId })

        console.log("Payment info:", {
          id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail,
          amount: paymentInfo.transaction_amount,
          currency: paymentInfo.currency_id,
          external_reference: paymentInfo.external_reference,
          payer_email: paymentInfo.payer?.email,
        })

        // Procesar según el estado del pago
        switch (paymentInfo.status) {
          case "approved":
            await handleApprovedPayment(paymentInfo)
            break
          case "rejected":
            await handleRejectedPayment(paymentInfo)
            break
          case "pending":
            await handlePendingPayment(paymentInfo)
            break
          case "cancelled":
            await handleCancelledPayment(paymentInfo)
            break
          default:
            console.log("Estado de pago no manejado:", paymentInfo.status)
        }
      } catch (paymentError) {
        console.error("Error fetching payment info:", paymentError)
      }
    }

    // Responder con 200 para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}

// Generar código OTP de 6 dígitos
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar OTP vía n8n → Twilio → WhatsApp
async function sendOTPViaWhatsApp(phone: string, code: string, name?: string) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_SEND_OTP_URL;

  if (!n8nWebhookUrl) {
    console.warn('⚠️ N8N_WEBHOOK_SEND_OTP_URL no configurada, saltando envío de WhatsApp');
    console.log(`📱 [DESARROLLO] Código OTP para ${phone}: ${code}`);
    return;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
        name: name || 'Usuario',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook falló: ${response.status}`);
    }

    console.log(`✅ OTP enviado exitosamente a ${phone}`);
  } catch (error) {
    console.error('❌ Error enviando OTP vía n8n:', error);
    throw new Error('Error al enviar código de verificación');
  }
}

// Funciones para manejar diferentes estados de pago
async function handleApprovedPayment(paymentInfo: any) {
  console.log("✅ Pago aprobado:", paymentInfo.id)

  try {
    // Extraer datos del pago y metadata
    const metadata = paymentInfo.metadata || {}
    const userId = metadata.user_id
    const userPhone = metadata.user_phone
    const planId = metadata.plan_id || extractPlanFromReference(paymentInfo.external_reference)
    
    console.log(`📦 Metadata recibida:`, {
      user_id: userId,
      user_phone: userPhone,
      plan_id: planId,
      payment_id: paymentInfo.id
    })

    // Validar que tenemos el ID del usuario
    if (!userId) {
      console.error('❌ No se encontró user_id en metadata. Usando flujo legacy.')
      await handleLegacyPaymentFlow(paymentInfo, planId)
      return
    }

    // Flujo principal: Usuario autenticado que completó el registro antes de pagar
    if (userPhone) {
      const user = await getUserByPhone(userPhone)

      if (user) {
        // Verificar que el user_id coincida
        if (user.id === userId) {
          // Actualizar plan del usuario
          await updateUserPlan(userPhone, 'plus')
          console.log(`✅ Plan Plus activado para usuario ${user.id} (${userPhone})`)

          // Guardar registro de la compra
          const purchase = {
            id: paymentInfo.id,
            userId: user.id,
            planId,
            planName: planId === "plus" ? "Plan Plus" : "Plan Desconocido",
            amount: paymentInfo.transaction_amount,
            currency: paymentInfo.currency_id,
            status: paymentInfo.status,
            date: new Date().toISOString(),
            paymentId: paymentInfo.id,
            email: user.email,
            phone: userPhone
          }
          await savePurchaseToDatabase(purchase)
        } else {
          console.error(`❌ user_id no coincide. Metadata: ${userId}, DB: ${user.id}`)
        }
      } else {
        console.error(`❌ Usuario no encontrado: ${userPhone}`)
      }
    } else {
      console.error(`❌ No se encontró user_phone en metadata`)
    }

  } catch (error) {
    console.error('❌ Error procesando pago aprobado:', error)
    // No lanzar error para no fallar el webhook
  }
}

// Flujo legacy para pagos sin autenticación previa (fallback)
async function handleLegacyPaymentFlow(paymentInfo: any, planId: string) {
  console.log('🔄 Ejecutando flujo legacy (sin autenticación previa)')
  
  try {
    const userEmail = paymentInfo.payer?.email
    const userPhone = paymentInfo.payer?.phone?.number
    const areaCode = paymentInfo.payer?.phone?.area_code

    // Construir número de teléfono completo (con código de país)
    let fullPhone = userPhone
    if (areaCode) {
      fullPhone = `+${areaCode}${userPhone}`
    } else if (userPhone && !userPhone.startsWith('+')) {
      fullPhone = `+54${userPhone}` // Por defecto Argentina
    }

    console.log(`Activando plan ${planId} para ${fullPhone || userEmail}`)

    if (planId === 'plus') {
      if (fullPhone) {
        // Buscar usuario por teléfono
        const existingUser = await getUserByPhone(fullPhone)

        if (existingUser) {
          // Usuario existe - actualizar plan
          await updateUserPlan(fullPhone, 'plus')
          console.log(`✅ Plan Plus activado para: ${fullPhone}`)
        } else {
          // Usuario no existe pero pagó (flujo legacy)
          // Crear usuario con plan Plus y enviar OTP
          await createUser({
            phone: fullPhone,
            email: userEmail,
            plan: 'plus'
          })
          console.log(`✅ Nuevo usuario creado con plan Plus: ${fullPhone}`)

          // Generar y enviar OTP para que complete el registro
          const otpCode = generateOTPCode()
          await createOTPCode(fullPhone, otpCode, 10) // 10 minutos de expiración
          await sendOTPViaWhatsApp(fullPhone, otpCode)
          console.log(`✅ OTP enviado a ${fullPhone} para completar registro`)
        }
      } else if (userEmail) {
        // No hay teléfono pero sí email (edge case)
        console.warn(`⚠️ Pago Plus sin teléfono. Email: ${userEmail}`)
      }
    }

    // Guardar registro de la compra
    const purchase = {
      id: paymentInfo.id,
      planId,
      planName: planId === "plus" ? "Plan Plus" : "Plan Desconocido",
      amount: paymentInfo.transaction_amount,
      currency: paymentInfo.currency_id,
      status: paymentInfo.status,
      date: new Date().toISOString(),
      paymentId: paymentInfo.id,
      email: userEmail,
      phone: fullPhone
    }
    await savePurchaseToDatabase(purchase)

  } catch (error) {
    console.error('❌ Error en flujo legacy:', error)
  }
}

async function handleRejectedPayment(paymentInfo: any) {
  console.log("❌ Pago rechazado:", paymentInfo.id)

  // Implementar lógica para pagos rechazados:
  // 1. Notificar al usuario
  // 2. Registrar intento fallido
  // 3. Sugerir métodos alternativos
}

async function handlePendingPayment(paymentInfo: any) {
  console.log("⏳ Pago pendiente:", paymentInfo.id)

  // Implementar lógica para pagos pendientes:
  // 1. Notificar al usuario sobre el estado
  // 2. Configurar seguimiento del pago
}

async function handleCancelledPayment(paymentInfo: any) {
  console.log("🚫 Pago cancelado:", paymentInfo.id)

  // Implementar lógica para pagos cancelados:
  // 1. Limpiar datos temporales
  // 2. Registrar cancelación
}

// Función auxiliar para extraer el plan de la referencia externa
function extractPlanFromReference(externalReference: string): string {
  // El formato es: "zecu-{planId}-{userId}-{timestamp}" o "zecu-{planId}-{timestamp}"
  if (externalReference) {
    const parts = externalReference.split("-")
    return parts[1] || "unknown"
  }
  return "unknown"
}

// Manejar GET para verificación del webhook
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}

// Función para guardar la compra en la base de datos
async function savePurchaseToDatabase(purchase: any) {
  // Implementar la lógica para guardar la compra en la base de datos
  console.log("Guardando compra en la base de datos:", purchase)
}
