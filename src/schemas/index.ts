import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'A senha deve conter no mínimo 4 caracteres')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

export const ticketSchema = z.object({
  subject: z.string().min(3, 'O assunto deve ter pelo menos 3 caracteres'),
  category: z.string().min(2, 'Selecione uma categoria'),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional().default('MEDIA'),
  initialText: z.string().min(5, 'A mensagem deve ter no mínimo 5 caracteres')
});

export const couponSchema = z.object({
  code: z.string().min(3, 'O código deve ter pelo menos 3 caracteres').transform(v => v.toUpperCase().trim()),
  discountPercent: z.number().min(1).max(100),
  maxUses: z.number().int().positive()
});

export const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['TON_PIX', 'CARTAO', 'SALDO_CARTEIRA']).default('TON_PIX')
});
