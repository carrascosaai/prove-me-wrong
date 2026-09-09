import { customAlphabet } from "nanoid";

// URL-safe, unambiguous alphabet (no 0/O/1/l/I).
const nanoid = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 8);

export function newSlug(): string {
  return nanoid();
}

export function newToken(): string {
  return customAlphabet(
    "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
    28,
  )();
}
