import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Institutional email is required')
    .email('Invalid email address')
    .refine((val) => val.endsWith('@sliit.lk'), {
      message: 'Access restricted to @sliit.lk domains',
    }),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine((val) => val.endsWith('@sliit.lk'), {
      message: 'Only @sliit.lk institutional emails are permitted',
    }),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Include one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Include one special character')
    .regex(/[0-9]/, 'Include one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginFields = z.infer<typeof loginSchema>;
export type SignupFields = z.infer<typeof signupSchema>;

export type LoginInput = LoginFields;
export type SignupInput = SignupFields;
