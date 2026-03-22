import { z } from 'zod';

export const emailChangeSchema = z.object({
    newEmail: z.string()
        .min(1, 'New email is required')
        .email('Invalid email format')
        .endsWith('@sliit.lk', 'Only @sliit.lk emails are permitted'),
    password: z.string().min(1, 'Password is required'),
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Minimum 8 characters')
        .regex(/[A-Z]/, 'Must include an uppercase letter')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character')
        .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required to confirm deletion'),
});

export type EmailChangeInput = z.infer<typeof emailChangeSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
