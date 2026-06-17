import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import type { Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form, type FormItemProps } from 'antd';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  errors?: Partial<Record<Path<T>, FieldError | undefined>>;
  children: ReactElement;
  formItemProps?: Omit<FormItemProps, 'label' | 'validateStatus' | 'help'>;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  errors,
  children,
  formItemProps,
}: FormFieldProps<T>) {
  const error = errors?.[name];
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item
          label={label}
          validateStatus={error ? 'error' : undefined}
          help={error?.message}
          {...formItemProps}
        >
          {cloneElement(children, { ...field } as Record<string, unknown>)}
        </Form.Item>
      )}
    />
  );
}
