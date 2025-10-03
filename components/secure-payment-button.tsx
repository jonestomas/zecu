"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface SecurePaymentButtonProps {
  planId: string;
  planName: string;
  price: string;
  className?: string;
  children?: React.ReactNode;
}

// Hook para detectar bots simples
function useSecurityChecks() {
  const [isSecure, setIsSecure] = useState(false);
  const [challenges, setChallenges] = useState({
    userAgent: false,
    timing: false,
    interaction: false
  });

  useEffect(() => {
    // 1. Verificar User-Agent (detectar bots básicos)
    const userAgent = navigator.userAgent;
    const isValidUA = userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Safari');
    setChallenges(prev => ({ ...prev, userAgent: isValidUA }));

    // 2. Verificar timing (los bots suelen ser muy rápidos)
    const startTime = Date.now();
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      setChallenges(prev => ({ ...prev, timing: elapsed > 1000 })); // Al menos 1 segundo
    }, 1100);

    // 3. Verificar que es una interacción real del usuario
    const handleInteraction = () => {
      setChallenges(prev => ({ ...prev, interaction: true }));
    };

    // Escuchar eventos de usuario
    window.addEventListener('mousemove', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    // Considerar seguro si pasa al menos 2 de 3 verificaciones
    const passedChecks = Object.values(challenges).filter(Boolean).length;
    setIsSecure(passedChecks >= 2);
  }, [challenges]);

  return { isSecure, challenges };
}

export function SecurePaymentButton({ 
  planId, 
  planName, 
  price, 
  className = "", 
  children 
}: SecurePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const { isSecure } = useSecurityChecks();

  const handlePayment = async () => {
    // 1. Prevenir doble clic / spam
    const now = Date.now();
    if (now - lastClickTime < 2000) { // 2 segundos entre clics
      console.warn('🚨 Clic demasiado rápido detectado');
      return;
    }
    setLastClickTime(now);
    setClickCount(prev => prev + 1);

    // 2. Límite de intentos por sesión
    if (clickCount >= 5) {
      alert('Demasiados intentos. Recarga la página.');
      return;
    }

    // 3. Verificar contexto de seguridad
    if (!isSecure) {
      console.warn('⚠️ Verificaciones de seguridad no completadas');
    }

    setIsLoading(true);
    
    try {
      // 4. Generar token anti-CSRF simple
      const csrfToken = generateCSRFToken();
      
      // 5. Preparar datos seguros
      const requestData = {
        planId,
        userEmail: 'usuario@ejemplo.com', // En producción: obtener del usuario autenticado
        timestamp: Date.now(),
        csrfToken,
        // Fingerprint básico del navegador
        fingerprint: generateBrowserFingerprint()
      };

      // 6. Realizar solicitud con headers de seguridad
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(requestData),
        // Configuración de seguridad
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear la preferencia de pago');
      }

      const data = await response.json();
      
      // 7. Validar respuesta
      if (!data.initPoint && !data.sandboxInitPoint) {
        throw new Error('Respuesta inválida del servidor');
      }

      // 8. Redirigir de forma segura
      const paymentUrl = process.env.NODE_ENV === 'development' 
        ? data.sandboxInitPoint 
        : data.initPoint;
      
      if (paymentUrl && isValidURL(paymentUrl)) {
        // Log de seguridad
        console.log('🔒 Redirigiendo a pago seguro:', {
          plan: planId,
          timestamp: new Date().toISOString()
        });
        
        window.location.href = paymentUrl;
      } else {
        throw new Error('URL de pago inválida');
      }

    } catch (error) {
      console.error('❌ Error al procesar el pago:', error);
      
      // Error handling seguro (no exponer detalles internos)
      const userMessage = error instanceof Error && error.message.includes('preferencia')
        ? 'Error al procesar el pago. Por favor, intenta nuevamente.'
        : 'Ocurrió un error inesperado. Contacta al soporte.';
        
      alert(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || clickCount >= 5}
      className={`w-full ${className} relative`}
      type="button" // Prevenir submit accidental
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando de forma segura...
        </>
      ) : (
        <>
          <div className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            {children || `Pagar ${price} con Mercado Pago`}
            <Shield className="ml-2 h-3 w-3 text-green-500" />
          </div>
        </>
      )}
      
      {/* Indicador visual de seguridad */}
      {isSecure && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}

// Utilidades de seguridad
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ];
  
  // Hash simple (no criptográfico, solo para fingerprinting básico)
  return btoa(components.join('|')).substring(0, 16);
}

function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Solo permitir HTTPS en producción
    const allowedProtocols = process.env.NODE_ENV === 'development' 
      ? ['https:', 'http:'] 
      : ['https:'];
    
    const allowedDomains = [
      'mercadopago.com',
      'mercadopago.com.ar',
      'sandbox.mercadopago.com.ar'
    ];
    
    return allowedProtocols.includes(parsed.protocol) &&
           allowedDomains.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}
