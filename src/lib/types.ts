/**
 * Shared TypeScript Types and Interfaces
 * Domain-agnostic types used across the application
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User Context (from NextAuth session)
export interface UserContext {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
}

// Async Result Type (for error handling)
export type AsyncResult<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Optional Type
export type Optional<T> = T | null | undefined;

// Maybe Type (for cleaner null checks)
export type Maybe<T> = T | null;

// Entity ID types (for better type safety)
export type EntityId = string & { readonly __brand: 'EntityId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type TransactionId = string & { readonly __brand: 'TransactionId' };
export type AccountId = string & { readonly __brand: 'AccountId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };
export type BudgetId = string & { readonly __brand: 'BudgetId' };

// Branded string types (nominal types for better safety)
export function brandEntityId(id: string): EntityId {
  return id as EntityId;
}

export function brandUserId(id: string): UserId {
  return id as UserId;
}

export function brandTransactionId(id: string): TransactionId {
  return id as TransactionId;
}

export function brandAccountId(id: string): AccountId {
  return id as AccountId;
}

export function brandCategoryId(id: string): CategoryId {
  return id as CategoryId;
}

export function brandBudgetId(id: string): BudgetId {
  return id as BudgetId;
}
