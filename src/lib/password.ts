import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hash a plaintext password for storage in User.passwordHash. */
export function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/** Check a plaintext password against a stored hash. */
export function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}
