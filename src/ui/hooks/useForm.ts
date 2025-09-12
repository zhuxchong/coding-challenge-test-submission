import { useState, useCallback, ChangeEvent, useMemo, useRef } from "react";

interface FormValues {
  [key: string]: any;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  [key: string]: FieldError | undefined;
}

interface Rule {
  required?: boolean;
  message?: string;
  type?: "number" | "string";
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: any) => boolean | string | Promise<boolean | string>;
}

interface FormRules {
  [key: string]: Rule | Rule[];
}

function useForm<T extends FormValues>(initialValues: T, rules?: FormRules) {
  const valuesRef = useRef<T>(initialValues);
  const errorsRef = useRef<FormErrors>({});
  const touchedRef = useRef<Set<string>>(new Set());
  const fieldRulesRef = useRef<FormRules>({});

  const listenersRef = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const validateField = useCallback(
    async (name: string, value: any): Promise<FieldError | undefined> => {
      const allRules = { ...fieldRulesRef.current, ...rules };
      if (!allRules || !allRules[name]) return undefined;

      const rulesForField = allRules[name];
      const fieldRuleList = Array.isArray(rulesForField)
        ? rulesForField
        : [rulesForField];

      for (const rule of fieldRuleList as Rule[]) {
        if (rule.required && (!value || value === "")) {
          return { message: rule.message || `${name} is required` };
        }

        if (rule.type === "number" && value && value !== "") {
          if (isNaN(Number(value))) {
            return { message: rule.message || `${name} must be a number` };
          }
        }

        if (rule.pattern && value && !rule.pattern.test(String(value))) {
          return { message: rule.message || `${name} format is invalid` };
        }

        if (rule.min !== undefined) {
          if (typeof value === "string" && value.length < rule.min) {
            return {
              message:
                rule.message ||
                `${name} must be at least ${rule.min} characters`,
            };
          }
          if (typeof value === "number" && value < rule.min) {
            return {
              message: rule.message || `${name} must be at least ${rule.min}`,
            };
          }
        }

        if (rule.max !== undefined) {
          if (typeof value === "string" && value.length > rule.max) {
            return {
              message:
                rule.message ||
                `${name} must be at most ${rule.max} characters`,
            };
          }
          if (typeof value === "number" && value > rule.max) {
            return {
              message: rule.message || `${name} must be at most ${rule.max}`,
            };
          }
        }

        if (rule.validator) {
          const result = await rule.validator(value);
          if (result !== true) {
            return {
              message:
                typeof result === "string"
                  ? result
                  : rule.message || `${name} is invalid`,
            };
          }
        }
      }

      return undefined;
    },
    [rules]
  );

  const handleChange = useCallback(
    async (
      e:
        | ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | any
    ) => {
      let name: string;
      let value: any;

      if (e && e.target) {
        name = e.target.name;
        const { type } = e.target;
        value = e.target.value;

        if (type === "checkbox" && e.target instanceof HTMLInputElement) {
          value = e.target.checked;
        } else if (type === "number") {
          value = value === "" ? "" : Number(value);
        }
      } else if (typeof e === "object" && e.name && "value" in e) {
        name = e.name;
        value = e.value;
      } else {
        return;
      }

      valuesRef.current = {
        ...valuesRef.current,
        [name]: value,
      };

      notifyListeners();

      touchedRef.current.add(name);

      const error = await validateField(name, value);
      errorsRef.current = {
        ...errorsRef.current,
        [name]: error,
      };
    },
    [validateField, notifyListeners]
  );

  const setFieldValue = useCallback(
    async (name: keyof T, value: T[keyof T]) => {
      valuesRef.current = {
        ...valuesRef.current,
        [name]: value,
      };

      notifyListeners();

      const error = await validateField(String(name), value);
      errorsRef.current = {
        ...errorsRef.current,
        [String(name)]: error,
      };
    },
    [validateField, notifyListeners]
  );

  const setFieldsValue = useCallback(
    (newValues: Partial<T>) => {
      valuesRef.current = {
        ...valuesRef.current,
        ...newValues,
      };
      notifyListeners();
    },
    [notifyListeners]
  );

  const setFieldError = useCallback(
    (name: string, error: string | undefined) => {
      errorsRef.current = {
        ...errorsRef.current,
        [name]: error ? { message: error } : undefined,
      };
      notifyListeners();
    },
    [notifyListeners]
  );

  const validateFields = useCallback(async (): Promise<{
    isValid: boolean;
    values: T;
    errors: FormErrors;
  }> => {
    const newErrors: FormErrors = {};
    const currentValues = valuesRef.current;

    for (const key in currentValues) {
      const error = await validateField(key, currentValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    }

    errorsRef.current = newErrors;
    touchedRef.current = new Set(Object.keys(currentValues));
    notifyListeners();

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, values: currentValues, errors: newErrors };
  }, [validateField]);

  const resetForm = useCallback(() => {
    valuesRef.current = initialValues;
    errorsRef.current = {};
    touchedRef.current = new Set();
    notifyListeners();
  }, [initialValues, notifyListeners]);

  const clearForm = useCallback(() => {
    const clearedValues = Object.keys(valuesRef.current).reduce((acc, key) => {
      acc[key as keyof T] = "" as T[keyof T];
      return acc;
    }, {} as T);
    valuesRef.current = clearedValues;
    errorsRef.current = {};
    touchedRef.current = new Set();
    notifyListeners();
  }, [notifyListeners]);

  const getFieldError = useCallback((name: string): string | undefined => {
    return touchedRef.current.has(name) && errorsRef.current[name]
      ? errorsRef.current[name]?.message
      : undefined;
  }, []);

  const isFieldTouched = useCallback((name: string): boolean => {
    return touchedRef.current.has(name);
  }, []);

  const submit = useCallback(
    async (onSubmit: (values: T) => void | Promise<void>) => {
      const { isValid, values } = await validateFields();
      if (isValid) {
        await onSubmit(values);
      }
      return { isValid, values };
    },
    [validateFields]
  );

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errorsRef.current).some(
      (key) => errorsRef.current[key] !== undefined
    );
  }, []);

  const registerFieldRules = useCallback(
    (name: string, rules: Rule | Rule[]) => {
      fieldRulesRef.current = {
        ...fieldRulesRef.current,
        [name]: rules,
      };
    },
    []
  );

  const getValues = useCallback(() => valuesRef.current, []);

  const apiRef = useRef<any>(null);

  if (!apiRef.current) {
    apiRef.current = {
      get values() {
        return valuesRef.current;
      },
      get errors() {
        return errorsRef.current;
      },
      subscribe,
      handleChange,
      setFieldValue,
      setFieldsValue,
      setFieldError,
      getFieldError,
      isFieldTouched,
      validateFields,
      resetForm,
      clearForm,
      submit,
      hasErrors,
      registerFieldRules,
      getValues,
    };
  }

  Object.assign(apiRef.current, {
    subscribe,
    handleChange,
    setFieldValue,
    setFieldsValue,
    setFieldError,
    getFieldError,
    isFieldTouched,
    validateFields,
    resetForm,
    clearForm,
    submit,
    hasErrors,
    registerFieldRules,
    getValues,
  });

  return apiRef.current;
}

export default useForm;
export type { Rule, FormRules, FormErrors, FieldError };
