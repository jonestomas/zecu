'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  error?: {
    message?: string;
    details?: string;
    statusCode?: number;
    requestId?: string;
  };
  reset?: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  // Log del error en el cliente (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && error) {
      console.error('Client-side error:', error);
    }
  }, [error]);

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  // Determinar el tipo de error y mensaje apropiado
  const getErrorInfo = () => {
    if (!error) {
      return {
        title: 'Algo salió mal',
        message: 'Ha ocurrido un error inesperado',
        details: 'Por favor, intenta nuevamente más tarde',
        icon: AlertTriangle,
        color: 'text-red-500'
      };
    }

    const statusCode = error.statusCode || 500;
    
    switch (statusCode) {
      case 400:
        return {
          title: 'Datos inválidos',
          message: 'La información proporcionada no es válida',
          details: 'Por favor, revisa los datos e intenta nuevamente',
          icon: AlertTriangle,
          color: 'text-yellow-500'
        };
      
      case 401:
        return {
          title: 'No autorizado',
          message: 'No tienes autorización para realizar esta acción',
          details: 'Por favor, inicia sesión e intenta nuevamente',
          icon: AlertTriangle,
          color: 'text-yellow-500'
        };
      
      case 403:
        return {
          title: 'Acceso denegado',
          message: 'No tienes permisos para acceder a este recurso',
          details: 'Contacta al administrador si crees que esto es un error',
          icon: AlertTriangle,
          color: 'text-red-500'
        };
      
      case 404:
        return {
          title: 'Página no encontrada',
          message: 'La página que buscas no existe',
          details: 'Verifica que la URL sea correcta',
          icon: AlertTriangle,
          color: 'text-blue-500'
        };
      
      case 429:
        return {
          title: 'Demasiadas solicitudes',
          message: 'Has realizado demasiadas solicitudes',
          details: 'Por favor, espera unos minutos antes de intentar nuevamente',
          icon: RefreshCw,
          color: 'text-orange-500'
        };
      
      case 500:
      default:
        return {
          title: 'Error del servidor',
          message: 'Ha ocurrido un error interno del servidor',
          details: 'Por favor, intenta nuevamente más tarde',
          icon: AlertTriangle,
          color: 'text-red-500'
        };
    }
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <IconComponent className={`h-6 w-6 ${errorInfo.color}`} />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorInfo.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {errorInfo.details}
          </p>
          
          {/* Mostrar detalles adicionales solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Status:</strong> {error.statusCode || 'Unknown'}
              </p>
              {error.requestId && (
                <p className="text-xs text-gray-600">
                  <strong>Request ID:</strong> {error.requestId}
                </p>
              )}
              {error.message && (
                <p className="text-xs text-gray-600">
                  <strong>Error:</strong> {error.message}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar nuevamente
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </div>
          </div>
          
          {/* Información de contacto */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Si el problema persiste, contacta a{' '}
              <a 
                href="mailto:support@zecu.app" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@zecu.app
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
