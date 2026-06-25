import { z } from 'zod';
import xss from 'xss';

/**
 * Strips potentially dangerous HTML/Script tags from user input to prevent Cross-Site Scripting (XSS).
 * Uses the `xss` library to whitelist safe tags or completely strip everything.
 * 
 * @param input Raw string from user
 * @returns Sanitized string safe for DB insertion and rendering
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;
  return xss(input, {
    whiteList: {}, // Empty whitelist means ALL html tags are stripped out
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'] // Remove <script> and <style> entirely
  });
}

/**
 * Validates and sanitizes a string input using a Zod schema.
 * 
 * Example usage:
 * const name = safeStringSchema.parse(req.body.name);
 */
export const safeStringSchema = z.string().transform((val) => sanitizeInput(val));

/**
 * Validates and sanitizes an email address.
 */
export const safeEmailSchema = z.string().email().transform((val) => sanitizeInput(val.toLowerCase().trim()));

/**
 * A standard pagination schema for list API routes
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});
