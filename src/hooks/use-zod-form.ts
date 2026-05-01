"use client";
import { useState } from "react";
import { ZodSchema } from "zod";

export function useZodForm<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown): data is T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        const msgList = msgs as string[] | undefined;
        if (msgList && msgList.length > 0) fieldErrors[key] = msgList[0];
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const clearErrors = () => setErrors({});
  const setFieldError = (field: string, msg: string) => setErrors(prev => ({ ...prev, [field]: msg }));

  return { errors, validate, clearErrors, setFieldError };
}
