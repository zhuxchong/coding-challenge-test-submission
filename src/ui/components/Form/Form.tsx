import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import { Rule, FormErrors } from "@/hooks/useForm";

interface FormInstance {
  values: Record<string, any>;
  errors: FormErrors;
  handleChange: (e: any) => void | Promise<void>;
  setFieldError: (name: string, error: string | undefined) => void;
  getFieldError: (name: string) => string | undefined;
  setFieldValue: (name: any, value: any) => void | Promise<void>;
  registerFieldRules?: (name: string, rules: Rule | Rule[]) => void;
  validateFields?: () => Promise<{
    isValid: boolean;
    values: any;
    errors: FormErrors;
  }>;
  clearForm?: () => void;
  resetForm?: () => void;
  hasErrors?: () => boolean;
  isFieldTouched?: (name: string) => boolean;
  submit?: (
    onSubmit: (values: any) => void | Promise<void>
  ) => Promise<{ isValid: boolean; values: any }>;
  subscribe?: (listener: () => void) => () => void;
  getValues?: () => any;
}

interface FormContextValue extends FormInstance {
  formName?: string;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Field must be used within a Form");
  }
  return context;
};

interface FormProps {
  form: FormInstance;
  name?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onValuesChange?: (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => void;
  children: ReactNode;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  form,
  name,
  onSubmit,
  onValuesChange,
  children,
  className,
}) => {
  const [, forceUpdate] = useState({});
  const previousValuesRef = useRef(form.values);

  useEffect(() => {
    if (form.subscribe) {
      return form.subscribe(() => {
        if (onValuesChange) {
          const currentValues = form.values;
          const previousValues = previousValuesRef.current;

          // Find changed fields
          const changedValues: Record<string, any> = {};
          for (const key in currentValues) {
            if (currentValues[key] !== previousValues[key]) {
              changedValues[key] = currentValues[key];
            }
          }

          if (Object.keys(changedValues).length > 0) {
            onValuesChange(changedValues, currentValues);
          }

          previousValuesRef.current = { ...currentValues };
        }

        forceUpdate({});
      });
    }
  }, [form, onValuesChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.validateFields) {
      const { isValid } = await form.validateFields();
      if (!isValid) {
        return;
      }
    }

    if (onSubmit) {
      await onSubmit(e);
    }
  };

  return (
    <FormContext.Provider value={{ ...form, formName: name }}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

export default Form;
export type { FormInstance, FormContextValue };
