// src/components/ui/use-toast.ts (MOCK HOOK)

import React from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success'; 
  action?: React.ReactElement | React.ReactNode;
  className?: string;
}

/**
 * MOCK useToast Hook.
 * This is a temporary file to allow components to compile.
 * It logs toast calls to the console instead of displaying a real toast.
 */
export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      let icon = props.variant === 'destructive' ? '🚨' : (props.variant === 'success' ? '✅' : 'ℹ️');
      console.log(`[MOCK TOAST - ${icon}] ${props.title}: ${props.description}`);
    },
    dismiss: (id?: string) => {
      console.log(`[MOCK TOAST] Dismissed: ${id}`);
    },
  };
};