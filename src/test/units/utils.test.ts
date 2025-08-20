import { describe, it, expect, vi, beforeEach } from 'vitest';

// Example utility functions to test
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock external API
export const fetchUserData = async (userId: string) => {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
};

// Tests
describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-08-20T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-08-20');
    });

    it('should handle different dates', () => {
      const date = new Date('2023-12-25T23:59:59Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2023-12-25');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('number');
      expect(typeof id2).toBe('number');
    });

    it('should generate positive numbers', () => {
      const id = generateId();
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(95); // Allow small variance
    });

    it('should work with zero delay', async () => {
      const start = Date.now();
      await delay(0);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('fetchUserData', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.restoreAllMocks();
    });

    it('should fetch user data successfully', async () => {
      const mockUser = { id: '123', name: 'John Doe' };
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUser)
      } as any);

      const result = await fetchUserData('123');
      
      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/123');
    });

    it('should handle fetch errors', async () => {
      // Mock failed fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      } as any);

      await expect(fetchUserData('999')).rejects.toThrow('Failed to fetch user data');
    });

    it('should handle network errors', async () => {
      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(fetchUserData('123')).rejects.toThrow('Network error');
    });
  });
});