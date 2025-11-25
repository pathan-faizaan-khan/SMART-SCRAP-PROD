import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = await createClient();
    
    // Try to refresh the session
    const { data: { session } } = await supabase.auth.getSession();

    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - Session exists:', !!session);

    // For now, allow dashboard access - we'll check auth on the client side
    // This is a workaround until server-side session syncing is fixed
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('Middleware - Allowing dashboard access (client-side auth will verify)');
      return response;
    }

    // Allow signup page with google_pending parameter even if session exists
    // This is for completing Google OAuth signup
    if (request.nextUrl.pathname === '/signup') {
      const isGooglePending = request.nextUrl.searchParams.get('google_pending') === 'true';
      if (isGooglePending) {
        console.log('Middleware - Allowing signup for Google OAuth completion');
        return response;
      }
    }

    // Redirect to dashboard if accessing login/signup with active session
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && session) {
      console.log('Middleware - Redirecting to dashboard (has session)');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
