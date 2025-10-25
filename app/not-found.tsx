import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Search className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Página no encontrada
          </CardTitle>
          <CardDescription className="text-gray-600">
            La página que buscas no existe o ha sido movida
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Verifica que la URL sea correcta o utiliza los enlaces de navegación
          </p>
          
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
            
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver atrás
            </Button>
          </div>
          
          {/* Enlaces útiles */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Enlaces útiles:
            </p>
            <div className="space-y-1">
              <Link 
                href="/login" 
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register" 
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Registrarse
              </Link>
              <Link 
                href="/dashboard" 
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Información de contacto */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              ¿Necesitas ayuda? Contacta a{' '}
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
