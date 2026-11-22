import { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Dropdown, type DropdownOption } from '@/shared/ui/Dropdown';
import { Form } from '@/shared/ui/Form';
import { SearchBar } from '@/shared/ui/SearchBar';
import { FormField } from '@/shared/ui/TextField';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter at least two characters.'),
  email: z.email('Enter a valid email address.'),
});

type Values = z.infer<typeof schema>;

type Priority = 'low' | 'normal' | 'high';

const priorities: readonly DropdownOption<Priority>[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const examples = ['Account', 'Address', 'Billing', 'Notifications'];

export const FormsShowcaseScreen = () => {
  const { colors, radii, spacing } = useTheme();
  const [priority, setPriority] = useState<Priority | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitted' | 'failed'>('idle');
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  const search = query.trim().toLowerCase();
  const matches = examples.filter((item) => item.toLowerCase().includes(search));

  return (
    <Form
      form={form}
      submitLabel="Validate form"
      onSubmit={() => setStatus('submitted')}
      onInvalid={() => setStatus('idle')}
      onSubmitError={() => setStatus('failed')}
    >
      <AppText variant="heading">Form and text fields</AppText>
      <FormField
        control={form.control}
        name="name"
        label="Name"
        autoCapitalize="words"
        autoComplete="name"
      />
      <FormField
        control={form.control}
        name="email"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      {status === 'submitted' ? (
        <AppText accessibilityLiveRegion="polite" style={{ color: colors.success }}>
          Form validated locally.
        </AppText>
      ) : null}
      {status === 'failed' ? (
        <AppText accessibilityLiveRegion="polite" tone="danger">
          The form could not be submitted.
        </AppText>
      ) : null}
      <Dropdown label="Priority" value={priority} options={priorities} onChange={setPriority} />
      <SearchBar
        label="Search examples"
        placeholder="Filter the options below"
        value={query}
        onChangeText={setQuery}
      />
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        {matches.length ? (
          matches.map((label) => <AppText key={label}>{label}</AppText>)
        ) : (
          <AppText tone="muted" accessibilityLiveRegion="polite">
            No examples match your search.
          </AppText>
        )}
      </View>
    </Form>
  );
};
