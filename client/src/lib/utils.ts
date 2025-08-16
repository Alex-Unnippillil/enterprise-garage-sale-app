import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanParams<T extends Record<string, any>>(params: T): T {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as T;
}

export async function withToast<T>(
  promise: Promise<T>,
  _messages?: { success?: string; error?: string }
): Promise<T> {
  return promise;
}

export async function createNewUserInDatabase(
  user: any,
  _idToken: any,
  userRole: string,
  fetchWithBQ: any
) {
  const endpoint = userRole === "manager" ? "/managers" : "/tenants";
  return fetchWithBQ(endpoint, {
    method: "POST",
    body: { cognitoId: user.userId },
  });
}

export function formatEnumString(value: string): string {
  return value.replace(/([A-Z])/g, " $1").trim();
}

export function formatPriceValue(
  value: number | null | undefined,
  _isMin?: boolean
): string {
  if (value == null) return "any";
  return `$${value}`;
}

