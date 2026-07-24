import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduza um email válido."),
  password: z.string().min(1, "Introduza a palavra-passe."),
});
