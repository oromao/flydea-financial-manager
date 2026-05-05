/**
 * Application Constants
 * All magic strings and numbers should be defined here
 */

// File Upload Constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 20,
  MAX_FILE_SIZE_BYTES: 20 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'text/plain',
    'image/heic',
    'image/heif',
  ] as const,
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.heic', '.heif'] as const,
};

// Validation Constraints
export const VALIDATION = {
  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 255,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  OBSERVATIONS_MAX_LENGTH: 1000,
  CATEGORY_NAME_MAX_LENGTH: 255,
  TAG_NAME_MAX_LENGTH: 100,
};

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
} as const;

// Account Types
export const ACCOUNT_TYPES = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  CREDIT: 'CREDIT',
  CASH: 'CASH',
} as const;

// Budget Period
export const BUDGET_PERIODS = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

// Recurrence Frequency
export const RECURRENCE_FREQUENCIES = {
  NONE: 'NONE',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// Error Messages (PT-BR)
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Você não tem permissão para esta ação',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
  TRANSACTION_NOT_FOUND: 'Transação não encontrada',
  ACCOUNT_NOT_FOUND: 'Conta não encontrada',
  CATEGORY_NOT_FOUND: 'Categoria não encontrada',
  BUDGET_NOT_FOUND: 'Orçamento não encontrado',
  RECURRENCE_NOT_FOUND: 'Recorrência não encontrada',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Rate Limiting
export const RATE_LIMITING = {
  LOGIN_ATTEMPTS_WINDOW_SECONDS: 60,
  LOGIN_ATTEMPTS_MAX: 5,
} as const;

// Cache
export const CACHE = {
  DEFAULT_TTL_SECONDS: 3600,
  CATEGORIES_TTL_SECONDS: 7200,
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
  FULL: 'dd MMMM yyyy HH:mm:ss',
} as const;

/**
 * Feature flags for controlling UI visibility.
 * Set to false to hide features from end users without deleting code.
 */
export const FEATURE_FLAGS = {
  /** Controls all AI/IA features (Copilot, Insights, Agents, AI Chat) */
  ENABLE_AI_FEATURES: false,
} as const;
