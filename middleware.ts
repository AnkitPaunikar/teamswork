import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the public routes
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, request) => {
  const { userId } = auth();

  // If user is logged out and trying to access a public route, allow access
  if (!userId && isPublicRoute(request)) {
    return NextResponse.next(); // Allow access to public routes
  }

  // If user is logged in and trying to access a public route, redirect to dashboard
  if (userId && isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url)); // Redirect to the dashboard if logged in
  }

  // If the user is not logged in and it's not a public route, protect it
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url)); // Redirect to sign-in
  }

  // Proceed with the request if no redirects or protection needed
  return NextResponse.next(); // Ensure that we always return a NextResponse
});

// Config matcher for the middleware
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
