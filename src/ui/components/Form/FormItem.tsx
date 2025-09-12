import React, {
  ReactElement,
  cloneElement,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Rule } from "@/hooks/useForm";
import $ from "./Form.module.css";

interface FieldProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  name: string;
  id?: string;
}

interface FieldMeta {
  error?: string;
  touched?: boolean;
}

interface FormItemProps {
  name: string;
  label?: string;
  value?: any;
  onChange?: (value: any) => void;
  onError?: (name: string, error: string | undefined) => void;
  error?: string;
  required?: boolean;
  rules?: Rule | Rule[];
  valuePropName?: string;
  trigger?: string;
  validateTrigger?: string | string[];
  getValueFromEvent?: (e: any) => any;
  children:
    | ReactElement
    | ((props: FieldProps, meta?: FieldMeta) => ReactElement);
  className?: string;
  formName?: string;
}

const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  value,
  onChange,
  onError,
  error: externalError,
  required,
  rules,
  valuePropName = "value",
  trigger = "onChange",
  getValueFromEvent,
  children,
  className,
  formName,
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validateField = useCallback(
    async (fieldValue: any): Promise<string | undefined> => {
      if (!rules) return undefined;

      const fieldRules = Array.isArray(rules) ? rules : [rules];

      for (const rule of fieldRules) {
        if (rule.required && (!fieldValue || fieldValue === "")) {
          return rule.message || `${name} is required`;
        }

        if (rule.type === "number" && fieldValue && fieldValue !== "") {
          if (isNaN(Number(fieldValue))) {
            return rule.message || `${name} must be a number`;
          }
        }

        if (
          rule.pattern &&
          fieldValue &&
          !rule.pattern.test(String(fieldValue))
        ) {
          return rule.message || `${name} format is invalid`;
        }

        if (rule.min !== undefined) {
          if (typeof fieldValue === "string" && fieldValue.length < rule.min) {
            return (
              rule.message || `${name} must be at least ${rule.min} characters`
            );
          }
          if (typeof fieldValue === "number" && fieldValue < rule.min) {
            return rule.message || `${name} must be at least ${rule.min}`;
          }
        }

        if (rule.max !== undefined) {
          if (typeof fieldValue === "string" && fieldValue.length > rule.max) {
            return (
              rule.message || `${name} must be at most ${rule.max} characters`
            );
          }
          if (typeof fieldValue === "number" && fieldValue > rule.max) {
            return rule.message || `${name} must be at most ${rule.max}`;
          }
        }

        if (rule.validator) {
          const result = await rule.validator(fieldValue);
          if (result !== true) {
            return typeof result === "string"
              ? result
              : rule.message || `${name} is invalid`;
          }
        }
      }

      return undefined;
    },
    [rules, name]
  );

  useEffect(() => {
    if (value !== "" && value !== undefined) {
      validateField(value).then((error) => {
        setInternalError(error);
        if (onError) {
          onError(name, error);
        }
      });
    }
  }, []);

  const handleChange = useCallback(
    async (e: any) => {
      let newValue: any;

      if (getValueFromEvent) {
        newValue = getValueFromEvent(e);
      } else if (e && e.target && typeof e.target.value !== "undefined") {
        newValue = e.target.value;
      } else if (e && e.target && typeof e.target.checked !== "undefined") {
        newValue = e.target.checked;
      } else {
        newValue = e;
      }

      setTouched(true);

      const error = await validateField(newValue);
      setInternalError(error);

      if (onError) {
        onError(name, error);
      }

      if (onChange) {
        onChange({ name, value: newValue });
      }
    },
    [onChange, onError, getValueFromEvent, name, validateField]
  );

  const error = externalError || (touched ? internalError : undefined);

  const fieldId = formName ? `${formName}_${name}` : name;

  const fieldProps: FieldProps = useMemo(
    () => ({
      value: value ?? "",
      onChange: handleChange,
      error: error,
      name,
      id: fieldId,
    }),
    [value, handleChange, error, name, fieldId]
  );

  const fieldMeta: FieldMeta = useMemo(
    () => ({
      error: error,
      touched: touched,
    }),
    [error, touched]
  );

  const enhancedChild = useMemo(() => {
    if (typeof children === "function") {
      return children(fieldProps, fieldMeta);
    }

    const childProps = {
      [valuePropName]: value ?? "",
      [trigger]: handleChange,
      name,
      id: fieldId,
      ...(error && { error: true }),
    };

    return cloneElement(children, childProps);
  }, [
    children,
    fieldProps,
    fieldMeta,
    valuePropName,
    value,
    trigger,
    handleChange,
    name,
    error,
    fieldId,
  ]);

  const isRequired =
    required ||
    (rules &&
      (Array.isArray(rules) ? rules.some((r) => r.required) : rules.required));

  return (
    <div className={`${$.formRow} ${className || ""}`}>
      {label && (
        <label htmlFor={fieldId} className={$.label}>
          {label}
          {isRequired && <span className={$.required}>*</span>}
        </label>
      )}
      {enhancedChild}
      {error && <div className={$.error}>{error}</div>}
    </div>
  );
};

export default FormItem;
