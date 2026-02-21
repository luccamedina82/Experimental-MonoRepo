import { z } from 'zod';


export const loginSchema = z.object({
  email: z.email('El formato del email no es válido'),
  password: z
    .string({ message: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;