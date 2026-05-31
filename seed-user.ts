import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/db/schema";
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client, { schema });

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

async function run() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        name: "Usuario de Prueba",
        email: "prueba@gmail.com",
        password: "prueba123",
      }
    });
    console.log("¡Usuario de prueba creado con éxito!");
    console.log(res.user);
  } catch (err) {
    console.error("Error creando el usuario:", err);
  }
}

run();
