import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedPaths = ["/absen", "/rekap", "/admin", "/kepsek", "/profile"];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login page
  if (user && pathname === "/login") {
    // Get user role for redirect
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    switch (profile?.role) {
      case "kepala_sekolah":
        url.pathname = "/kepsek/dashboard";
        break;
      case "admin":
        url.pathname = "/admin/dashboard";
        break;
      default:
        url.pathname = "/absen";
        break;
    }
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Admin routes: only admin and kepala_sekolah
    if (pathname.startsWith("/admin")) {
      if (
        profile?.role !== "admin" &&
        profile?.role !== "kepala_sekolah"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/absen";
        return NextResponse.redirect(url);
      }
    }

    // Kepsek routes: only kepala_sekolah
    if (pathname.startsWith("/kepsek")) {
      if (profile?.role !== "kepala_sekolah") {
        const url = request.nextUrl.clone();
        url.pathname = "/absen";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}