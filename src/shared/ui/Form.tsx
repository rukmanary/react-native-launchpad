import { useRef, type PropsWithChildren } from 'react';
import {
  FormProvider,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import { FormScreen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';

export type FormProps<
  Input extends FieldValues,
  Context,
  Output extends FieldValues,
> = PropsWithChildren<{
  form: UseFormReturn<Input, Context, Output>;
  onSubmit: SubmitHandler<Output>;
  onSubmitError: (error: unknown) => void;
  onInvalid?: SubmitErrorHandler<Input>;
  submitLabel?: string;
  submitDisabled?: boolean;
}>;

export const Form = <Input extends FieldValues, Context, Output extends FieldValues>({
  form,
  onSubmit,
  onInvalid,
  onSubmitError,
  submitLabel = 'Submit',
  submitDisabled = false,
  children,
}: FormProps<Input, Context, Output>) => {
  const pending = useRef(false);
  const { handleSubmit, formState } = form;

  const submit = async () => {
    if (pending.current || submitDisabled) return;

    pending.current = true;
    try {
      await handleSubmit(onSubmit, onInvalid)();
    } catch (error) {
      onSubmitError(error);
    } finally {
      pending.current = false;
    }
  };

  return (
    <FormProvider {...form}>
      <FormScreen>
        {children}
        <Button
          label={submitLabel}
          onPress={() => {
            void submit();
          }}
          loading={formState.isSubmitting}
          disabled={submitDisabled}
        />
      </FormScreen>
    </FormProvider>
  );
};
