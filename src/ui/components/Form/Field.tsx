import React, { ReactElement, useEffect } from "react";
import FormItem from "./FormItem";
import { useFormContext } from "./Form";
import { Rule } from "@/hooks/useForm";

interface FieldProps {
  name: string;
  label?: string;
  rules?: Rule | Rule[];
  required?: boolean;
  valuePropName?: string;
  trigger?: string;
  getValueFromEvent?: (e: any) => any;
  children: ReactElement | ((props: any, meta?: any) => ReactElement);
  className?: string;
}

const Field: React.FC<FieldProps> = ({
  name,
  label,
  rules,
  required,
  valuePropName,
  trigger,
  getValueFromEvent,
  children,
  className,
}) => {
  const form = useFormContext();

  useEffect(() => {
    if (rules && form.registerFieldRules) {
      form.registerFieldRules(name, rules);
    }
  }, [name]);

  return (
    <FormItem
      name={name}
      label={label}
      value={form.values[name]}
      onChange={form.handleChange}
      onError={form.setFieldError}
      error={form.getFieldError ? form.getFieldError(name) : undefined}
      rules={rules}
      required={required}
      valuePropName={valuePropName}
      trigger={trigger}
      getValueFromEvent={getValueFromEvent}
      className={className}
      formName={form.formName}
    >
      {children}
    </FormItem>
  );
};

export default Field;
