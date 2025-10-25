import { type NextRequest, NextResponse } from 'next/server';

// Mock data - En producción, esto vendría de una base de datos
const _mockPurchases = [
  {
    id: '1',
    planName: 'Plan Plus',
    planId: 'plus',
    amount: 5499,
    currency: 'ARS',
    status: 'approved' as const,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
    paymentId: '12345678',
    email: 'usuario@ejemplo.com',
  },
  {
    id: '2',
    planName: 'Plan Plus',
    planId: 'plus',
    amount: 5499,
    currency: 'ARS',
    status: 'pending' as const,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    paymentId: '87654321',
    email: 'usuario@ejemplo.com',
  },
  {
    id: '3',
    planName: 'Plan Plus',
    planId: 'plus',
    amount: 5499,
    currency: 'ARS',
    status: 'rejected' as const,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
    paymentId: '11223344',
    email: 'usuario@ejemplo.com',
  },
];

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Filtrar compras por email
    const userPurchases = mockPurchases.filter(purchase => purchase.email === email);

    // Ordenar por fecha (más reciente primero)
    userPurchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      purchases: userPurchases,
      total: userPurchases.length,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Error fetching purchases' }, { status: 500 });
  }
}
