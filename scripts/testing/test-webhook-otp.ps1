# Script de Prueba de Webhook de OTP para n8n
# Uso: .\scripts\testing\test-webhook-otp.ps1

Write-Host "`n🧪 Test de Webhook de OTP - n8n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# URL del webhook (cambia según tu configuración)
$webhookUrl = "http://localhost:5678/webhook/zecubot-send-otp"

Write-Host "`n📡 URL del webhook: $webhookUrl" -ForegroundColor Yellow
Write-Host "`n⚠️  Asegúrate de que:" -ForegroundColor Yellow
Write-Host "   1. n8n esté corriendo (http://localhost:5678)" -ForegroundColor Gray
Write-Host "   2. El workflow 'Zecubot - Enviar OTP' esté ACTIVO" -ForegroundColor Gray
Write-Host "   3. Las credenciales de Twilio estén configuradas" -ForegroundColor Gray
Write-Host "`nPresiona Enter para continuar o Ctrl+C para cancelar..." -ForegroundColor Cyan
Read-Host

# Test 1: Datos completos (Happy Path)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ TEST 1: Envío exitoso (con todos los datos)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$test1 = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás Jones"
} | ConvertTo-Json

Write-Host "`n📤 Enviando:" -ForegroundColor Yellow
Write-Host $test1 -ForegroundColor Gray

try {
    $response1 = Invoke-RestMethod -Uri $webhookUrl -Method Post -ContentType "application/json" -Body $test1
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    Write-Host ($response1 | ConvertTo-Json -Depth 10) -ForegroundColor White
    Write-Host "`n📱 Verifica tu WhatsApp (+5491134070204)" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host ($_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
    }
}

Start-Sleep -Seconds 3

# Test 2: Sin nombre (debe usar "Usuario" por defecto)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ TEST 2: Sin nombre (debe usar 'Usuario' por defecto)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$test2 = @{
    phone = "+5491134070204"
    code = "999999"
} | ConvertTo-Json

Write-Host "`n📤 Enviando:" -ForegroundColor Yellow
Write-Host $test2 -ForegroundColor Gray

try {
    $response2 = Invoke-RestMethod -Uri $webhookUrl -Method Post -ContentType "application/json" -Body $test2
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    Write-Host ($response2 | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host ($_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
    }
}

Start-Sleep -Seconds 3

# Test 3: Número USA
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ TEST 3: Número USA" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$test3 = @{
    phone = "+12692562013"
    code = "555555"
    name = "John Doe"
} | ConvertTo-Json

Write-Host "`n📤 Enviando:" -ForegroundColor Yellow
Write-Host $test3 -ForegroundColor Gray

try {
    $response3 = Invoke-RestMethod -Uri $webhookUrl -Method Post -ContentType "application/json" -Body $test3
    Write-Host "`n✅ Respuesta exitosa:" -ForegroundColor Green
    Write-Host ($response3 | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host ($_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
    }
}

Start-Sleep -Seconds 3

# Test 4: Datos vacíos (debe fallar con 400)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "❌ TEST 4: Datos vacíos (debe fallar con error 400)" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$test4 = @{
    phone = ""
    code = ""
} | ConvertTo-Json

Write-Host "`n📤 Enviando:" -ForegroundColor Yellow
Write-Host $test4 -ForegroundColor Gray

try {
    $response4 = Invoke-RestMethod -Uri $webhookUrl -Method Post -ContentType "application/json" -Body $test4
    Write-Host "`n⚠️  Se esperaba un error pero se recibió respuesta exitosa:" -ForegroundColor Yellow
    Write-Host ($response4 | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "`n✅ Error esperado recibido:" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        Write-Host ($_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor White
    } else {
        Write-Host $_.Exception.Message -ForegroundColor White
    }
}

# Resumen
Write-Host "`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n✅ Tests completados" -ForegroundColor Green
Write-Host "`n💡 Siguiente paso:" -ForegroundColor Yellow
Write-Host "   1. Verifica tu WhatsApp para ver los mensajes" -ForegroundColor Gray
Write-Host "   2. Revisa las ejecuciones en n8n (Executions)" -ForegroundColor Gray
Write-Host "   3. Si todo funciona, actualiza N8N_WEBHOOK_SEND_OTP_URL en .env.local" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor Cyan
