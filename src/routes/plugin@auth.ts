import { type RequestHandler } from "@builder.io/qwik-city";
import { createAuth } from "../lib/auth";

export const onRequest: RequestHandler = async (event) => {
  const auth = createAuth(event.env);
  
  // Extraer la sesión validando los headers de la petición
  const session = await auth.api.getSession({
    headers: event.request.headers
  });
  
  // Guardamos la sesión en el sharedMap para que esté disponible en toda la aplicación
  event.sharedMap.set('session', session);

  const url = new URL(event.request.url);
  const isLoginPage = url.pathname.startsWith('/login');
  const isApiRoute = url.pathname.startsWith('/api');
  
  // Proteger todas las rutas: Si no hay sesión y no está en login ni api, redirigir a login
  if (!session && !isLoginPage && !isApiRoute) {
    throw event.redirect(302, '/login');
  }

  // Si ya tiene sesión activa e intenta ir a login, redirigir al dashboard
  if (session && isLoginPage) {
    throw event.redirect(302, '/');
  }
};
