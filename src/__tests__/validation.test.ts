import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, ticketSchema, couponSchema } from '../schemas';

describe('Zod Validation Schemas Test Suite', () => {
  it('should validate correct login credentials', () => {
    const validData = { email: 'ronisouza495@gmail.com', password: 'password123' };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in login', () => {
    const invalidData = { email: 'not-an-email', password: '123' };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate user registration data', () => {
    const validUser = { name: 'Ronilson', email: 'test@streamhub.com', password: 'securePassword123' };
    const result = registerSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should transform and uppercase coupon codes', () => {
    const couponData = { code: ' promo50 ', discountPercent: 50, maxUses: 10 };
    const result = couponSchema.safeParse(couponData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('PROMO50');
    }
  });

  it('should validate support ticket creation', () => {
    const ticketData = {
      subject: 'Ajuda com IPTV',
      category: 'IPTV',
      priority: 'ALTA' as const,
      initialText: 'Preciso de ajuda para configurar minha lista M3U no aplicativo.'
    };
    const result = ticketSchema.safeParse(ticketData);
    expect(result.success).toBe(true);
  });
});
