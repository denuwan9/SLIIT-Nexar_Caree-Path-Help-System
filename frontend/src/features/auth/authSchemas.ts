import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .refine((val) => val.endsWith('@sliit.lk'), {
      message: 'Only @sliit.lk institutional emails are permitted',
    }),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\\s]*$/, 'First name can only contain letters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\\s]*$/, 'Last name can only contain letters'),
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email format')
    .refine((val) => val.endsWith('@sliit.lk'), {
      message: 'Only @sliit.lk institutional emails are permitted',
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginFields = z.infer<typeof loginSchema>;
export type SignupFields = z.infer<typeof signupSchema>;

export type LoginInput = LoginFields;
export type SignupInput = SignupFields;
