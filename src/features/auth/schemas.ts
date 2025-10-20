import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  password: z
    .string()
    .min(6, 'Пароль должен быть минимум 6 символов'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Имя должно быть минимум 2 символа'),
  lastName: z
    .string()
    .min(2, 'Фамилия должна быть минимум 2 символа'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  password: z
    .string()
    .min(6, 'Пароль должен быть минимум 6 символов'),
  confirmPassword: z
    .string()
    .min(1, 'Подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
