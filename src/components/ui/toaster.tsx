import React from 'react';

/**
 * MOCK Toaster Component.
 * In a real ShadCN app, this component renders all toasts managed by the useToast hook.
 * For now, it's a null component to prevent compilation errors.
 */
const Toaster: React.FC = () => {
  console.log("MOCK TOASTER: Toasts will only appear in the console. Install the official ShadCN 'toast' and 'toaster' components when the registry is fixed.");
  return null; 
};

export { Toaster };