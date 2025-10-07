'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FreePlanOnboarding } from '@/components/free-plan-onboarding';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gift, Clock, Shield } from 'lucide-react';

interface FreeTrialButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
}

export function FreeTrialButton({ 
  className = "", 
  variant = "default",
  size = "default",
  children 
}: FreeTrialButtonProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartFreeTrial = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (whatsappNumber: string) => {
    setIsLoading(true);
    
    try {
      // Enviar datos al backend para crear la suscripción
      const response = await fetch('/api/subscriptions/free-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappNumber,
          source: 'website',
          metadata: {
            utmSource: 'landing_page',
            utmMedium: 'free_trial_button'
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Plan gratuito activado:', result.data);
        // Aquí podrías mostrar un mensaje de éxito o redirigir
        setShowOnboarding(false);
      } else {
        console.error('❌ Error activando plan gratuito:', result.message);
        // Aquí podrías mostrar un mensaje de error
      }
    } catch (error) {
      console.error('❌ Error en la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <Button
        onClick={handleStartFreeTrial}
        className={`${className} relative overflow-hidden`}
        variant={variant}
        size={size}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Gift className="h-4 w-4" />
            <span>{children || 'Prueba Gratuita'}</span>
            <div className="flex items-center space-x-1 text-xs opacity-80">
              <Clock className="h-3 w-3" />
              <span>7 días</span>
            </div>
          </div>
        )}
      </Button>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span>Activar Plan Gratuito</span>
            </DialogTitle>
          </DialogHeader>
          
          <FreePlanOnboarding
            onComplete={handleOnboardingComplete}
            onCancel={handleOnboardingCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}




