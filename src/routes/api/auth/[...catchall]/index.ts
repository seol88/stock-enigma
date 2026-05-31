import { type RequestHandler } from "@builder.io/qwik-city";
import { createAuth } from "../../../../lib/auth";

export const onRequest: RequestHandler = async (event) => {
  const auth = createAuth(event.env);
  const response = await auth.handler(event.request);
  
  event.status(response.status);
  response.headers.forEach((value, key) => {
    event.headers.set(key, value);
  });
  
  // En Qwik City event.send() maneja el cuerpo de la respuesta
  event.send(response.status, await response.text());
};
