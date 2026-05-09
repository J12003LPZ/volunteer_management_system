// Minimal form helpers — re-export only what page tasks rely on.
// Pages mostly use react-hook-form directly + Label + Input.
// We provide a `Form` wrapper for FormProvider parity in case any page expects it.
import * as React from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

export function Form({ form, children, ...rest }: { form: UseFormReturn<any> } & React.HTMLAttributes<HTMLFormElement>) {
  return (
    <FormProvider {...form}>
      <form {...rest}>{children}</form>
    </FormProvider>
  );
}
