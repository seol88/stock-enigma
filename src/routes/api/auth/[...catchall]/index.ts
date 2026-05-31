import { type RequestHandler } from "@builder.io/qwik-city";
import { createAuth } from "../../../../lib/auth";

export const onRequest: RequestHandler = async (event) => {
  // Bloquear intentos de registro público a menos que tengan un secreto (opcional)
  if (event.request.url.includes("/sign-up")) {
    event.status(403);
    event.send(403, "El registro de nuevos usuarios está deshabilitado.");
    return;
  }

  const auth = createAuth(event.env);
  const response = await auth.handler(event.request);
  
  event.status(response.status);
  response.headers.forEach((value, key) => {
    event.headers.set(key, value);
  });
  
  event.send(response.status, await response.text());
};
