import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    console.log('=== OAuth Callback START ===');
    console.log('Full URL:', request.url);
    console.log('Params:', { code: !!code, error, errorDescription });

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Redirect to client-side page to handle the OAuth callback
    // This is necessary because Supabase returns tokens in URL hash (implicit flow)
    // which can only be read client-side
    console.log('Redirecting to complete-oauth page');
    return NextResponse.redirect(new URL('/auth/complete-oauth', request.url));
  } catch (error) {
    console.error('=== OAuth Callback ERROR ===', error);
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
  }
}
