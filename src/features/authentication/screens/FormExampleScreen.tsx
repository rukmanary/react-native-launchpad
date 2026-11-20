import { useState } from 'react';
import { Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormScreen } from '../../../shared/ui/Screen';
import { FormField } from '../../../shared/ui/TextField';
import { Button } from '../../../shared/ui/Button';

const schema = z.object({ email: z.email(), password: z.string().min(8) });

type Form = z.infer<typeof schema>;

export function FormExampleScreen() {
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  return (
    <FormScreen>
      <Text>Form validation example. This form does not authenticate with a server.</Text>
      <FormField
        control={control}
        name="email"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        testID="email"
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        secureTextEntry
        autoComplete="current-password"
        testID="password"
      />
      <Button
        label="Validate"
        loading={isSubmitting}
        onPress={() => {
          void handleSubmit(() => setSubmitted(true))();
        }}
        testID="submit"
      />
      {submitted ? <Text accessibilityLiveRegion="polite">Validation passed</Text> : null}
    </FormScreen>
  );
}
