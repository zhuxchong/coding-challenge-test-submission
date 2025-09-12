import React, { ReactNode } from "react";
import Form, { FormInstance } from "./Form";
import Typography from "../Typography/Typography";
import Button from "../Button/Button";
// import $ from './Form.module.css';

interface StructuredFormProps {
  form: FormInstance;
  name?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onValuesChange?: (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => void;
  title?: string;
  subtitle?: string;
  legend?: string | ReactNode;
  submitText?: string;
  submitLoading?: boolean;
  children: ReactNode;
  className?: string;
  formClassName?: string;
  legendClassName?: string;
}

const StructuredForm: React.FC<StructuredFormProps> = ({
  form,
  name,
  onSubmit,
  onValuesChange,
  title,
  subtitle,
  legend,
  submitText = "Submit",
  submitLoading = false,
  children,
  className,
  formClassName,
  legendClassName,
}) => {
  return (
    <>
      {title && (
        <Typography variant="h1" theme="light">
          {title}
          {subtitle && (
            <>
              <br />
              <Typography variant="caption" theme="light" component="small">
                {subtitle}
              </Typography>
            </>
          )}
        </Typography>
      )}

      <Form
        form={form}
        name={name}
        onSubmit={onSubmit}
        onValuesChange={onValuesChange}
        className={formClassName || className}
      >
        <fieldset>
          {legend && (
            <Typography
              variant="label"
              theme="light"
              component="legend"
              className={legendClassName}
            >
              {legend}
            </Typography>
          )}

          {children}

          <Button type="submit" loading={submitLoading}>
            {submitText}
          </Button>
        </fieldset>
      </Form>
    </>
  );
};

export default StructuredForm;
