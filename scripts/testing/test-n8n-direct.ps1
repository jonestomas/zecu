# Test directo de conexión con n8n
# Este script prueba si el webhook de n8n está funcionando

Write-Host "`n🔍 Diagnóstico de Webhook n8n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Leer la URL del webhook desde .env.local
$envFile = Get-Content "zecu\.env.local" | Where-Object { $_ -match "N8N_WEBHOOK_SEND_OTP_URL" }
$webhookUrl = ($envFile -split "=", 2)[1].Trim()

if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
    Write-Host "`n❌ ERROR: N8N_WEBHOOK_SEND_OTP_URL no está configurada" -ForegroundColor Red
    exit 1
}

Write-Host "`n📡 URL del webhook:" -ForegroundColor Yellow
Write-Host "   $webhookUrl" -ForegroundColor White

# Verificar que no tenga espacios
if ($webhookUrl -match "\s") {
    Write-Host "`n⚠️  ADVERTENCIA: La URL tiene espacios. Esto puede causar problemas." -ForegroundColor Yellow
    $webhookUrl = $webhookUrl.Trim()
    Write-Host "   URL limpia: $webhookUrl" -ForegroundColor White
}

# Test 1: Verificar conectividad básica
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔌 TEST 1: Verificando conectividad..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $pingTest = Test-NetConnection -ComputerName "tjn8n.app.n8n.cloud" -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($pingTest) {
        Write-Host "✅ Conexión exitosa a n8n.cloud" -ForegroundColor Green
    } else {
        Write-Host "❌ No se puede conectar a n8n.cloud" -ForegroundColor Red
        Write-Host "   Verifica tu conexión a internet" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  No se pudo verificar conectividad (puede ser firewall)" -ForegroundColor Yellow
}

# Test 2: Enviar request de prueba
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📤 TEST 2: Enviando request de prueba..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$testPayload = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás Jones"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

Write-Host "`n📦 Payload:" -ForegroundColor Gray
Write-Host $testPayload -ForegroundColor DarkGray

Write-Host "`n⏳ Enviando request..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $webhookUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $testPayload `
        -UseBasicParsing `
        -TimeoutSec 10
    
    Write-Host "`n✅ Respuesta recibida:" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Content:" -ForegroundColor Gray
    Write-Host $response.Content -ForegroundColor White
    
    # Parsear JSON si es posible
    try {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "`n📊 Respuesta parseada:" -ForegroundColor Cyan
        Write-Host ($jsonResponse | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($jsonResponse.success) {
            Write-Host "`n🎉 ¡El webhook funciona correctamente!" -ForegroundColor Green
            Write-Host "`n💡 Siguiente paso:" -ForegroundColor Yellow
            Write-Host "   1. Verifica tu WhatsApp (+54 11 3407 0204)" -ForegroundColor Gray
            Write-Host "   2. Deberías haber recibido el código OTP" -ForegroundColor Gray
            Write-Host "   3. Si no lo recibiste, verifica:" -ForegroundColor Gray
            Write-Host "      - Credenciales de Twilio en n8n" -ForegroundColor DarkGray
            Write-Host "      - Número verificado en Twilio (si usas Trial)" -ForegroundColor DarkGray
        } else {
            Write-Host "`n⚠️  El webhook respondió pero con error:" -ForegroundColor Yellow
            Write-Host "   Error: $($jsonResponse.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "`n⚠️  No se pudo parsear la respuesta como JSON" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ ERROR al conectar con el webhook:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "`n💡 Error 404 - Webhook no encontrado" -ForegroundColor Yellow
            Write-Host "   Posibles causas:" -ForegroundColor Gray
            Write-Host "   1. El workflow no está ACTIVO en n8n" -ForegroundColor DarkGray
            Write-Host "   2. La URL del webhook es incorrecta" -ForegroundColor DarkGray
            Write-Host "   3. El workflow fue eliminado" -ForegroundColor DarkGray
        } elseif ($statusCode -eq 500) {
            Write-Host "`n💡 Error 500 - Error interno de n8n" -ForegroundColor Yellow
            Write-Host "   Revisa las ejecuciones en n8n para ver el error" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n🔧 Soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que el workflow esté ACTIVO en n8n" -ForegroundColor Gray
    Write-Host "   2. Revisa las ejecuciones en n8n.cloud" -ForegroundColor Gray
    Write-Host "   3. Verifica la URL del webhook en .env.local" -ForegroundColor Gray
    Write-Host "   4. Asegúrate de que no haya espacios en la URL" -ForegroundColor Gray
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Diagnóstico completado" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "`n"
