'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageCircle, Clock, Shield } from 'lucide-react';
import { FREE_PLAN_ONBOARDING, PLANS } from '@/lib/plans';

interface FreePlanOnboardingProps {
  onComplete: (whatsappNumber: string) => void;
  onCancel: () => void;
}

export function FreePlanOnboarding({ onComplete, onCancel }: FreePlanOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const currentOnboardingStep = FREE_PLAN_ONBOARDING[currentStep];
  const freePlan = PLANS.free;

  const handleWhatsAppRedirect = () => {
    // Formatear número de WhatsApp (agregar código de país si no lo tiene)
    let formattedNumber = whatsappNumber.replace(/\D/g, ''); // Solo números
    
    // Si no tiene código de país, asumir Argentina (+54)
    if (!formattedNumber.startsWith('54')) {
      formattedNumber = '54' + formattedNumber;
    }
    
    // Crear URL de WhatsApp con mensaje predefinido
    const message = encodeURIComponent(
      `¡Hola! Quiero activar mi plan gratuito de Zecu. Mi número es +${formattedNumber}`
    );
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Simular activación después de 2 segundos
    setTimeout(() => {
      onComplete(formattedNumber);
    }, 2000);
  };

  const handleNext = () => {
    if (currentStep < FREE_PLAN_ONBOARDING.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleWhatsAppRedirect();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateWhatsAppNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  };

  const renderStepContent = () => {
    switch (currentOnboardingStep.action) {
      case 'show_instructions':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido a Zecu!</h2>
              <p className="text-gray-600 mb-6">
                Tu asistente personal contra el phishing en WhatsApp
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">¿Qué incluye tu plan gratuito?</h3>
              <div className="grid gap-3">
                {freePlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-blue-800">Duración: {freePlan.duration} días</span>
              </div>
              <p className="text-sm text-blue-700">
                Tu plan gratuito durará {freePlan.duration} días desde la activación
              </p>
            </div>
          </div>
        );

      case 'redirect_whatsapp':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Conecta tu WhatsApp</h2>
              <p className="text-gray-600 mb-6">
                Para activar tu plan gratuito, necesitamos conectar tu número de WhatsApp
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {whatsappNumber && !validateWhatsAppNumber(whatsappNumber) && (
                  <p className="text-red-500 text-sm mt-1">
                    Por favor ingresa un número de WhatsApp válido
                  </p>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">¿Qué pasará después?</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. Se abrirá WhatsApp con un mensaje predefinido</li>
                  <li>2. Envía el mensaje a nuestro bot</li>
                  <li>3. Tu plan gratuito se activará automáticamente</li>
                  <li>4. Recibirás confirmación por WhatsApp</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'activate_plan':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Casi listo!</h2>
              <p className="text-gray-600 mb-6">
                Tu plan gratuito se activará en unos segundos
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Próximos pasos:</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. Envía el mensaje en WhatsApp</li>
                  <li>2. Espera la confirmación del bot</li>
                  <li>3. ¡Comienza a usar Zecu!</li>
                </ol>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Plan Gratuito - {freePlan.duration} días
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Activar Plan Gratuito</span>
          <span className="text-sm font-normal text-gray-500">
            Paso {currentStep + 1} de {FREE_PLAN_ONBOARDING.length}
          </span>
        </CardTitle>
        <CardDescription>
          {currentOnboardingStep.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            disabled={isValidating}
          >
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={
              isValidating || 
              (currentOnboardingStep.action === 'redirect_whatsapp' && 
               (!whatsappNumber || !validateWhatsAppNumber(whatsappNumber)))
            }
          >
            {currentStep === FREE_PLAN_ONBOARDING.length - 1 ? 'Abrir WhatsApp' : 'Siguiente'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}




