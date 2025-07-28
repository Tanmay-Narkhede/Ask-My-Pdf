import { clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';


const isPublicRoute = createRouteMatcher( [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)' ,// Home page
  ],
);
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) { // if the requested route is not public
    await auth.protect(); // protect all non-public routes
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};