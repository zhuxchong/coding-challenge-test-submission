import { useRef, useMemo } from 'react';
import useForm from './useForm';

/**
 * Create a stable form instance that won't cause parent component re-renders
 */
function useStableForm<T extends Record<string, any>>(initialValues: T, rules?: any) {
  // Create form instance only once
  const formRef = useRef<ReturnType<typeof useForm<T>> | null>(null);
  
  if (!formRef.current) {
    // This will only run once on mount
    formRef.current = useForm(initialValues, rules);
  }
  
  // Return a stable reference that never changes
  return useMemo(() => formRef.current!, []);
}

export default useStableForm;