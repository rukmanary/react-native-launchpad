import { memo, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { AppList } from '@/shared/ui/AppList';
import { Screen } from '@/shared/ui/Screen';
import { TextField } from '@/shared/ui/TextField';

const items = Array.from({ length: 1_000 }, (_, index) => ({
  id: String(index + 1),
  title: `Item ${String(index + 1).padStart(3, '0')}`,
}));

type Item = (typeof items)[number];

const Row = memo(({ item }: { item: Item }) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border, padding: spacing.md }]}>
      <AppText>{item.title}</AppText>
    </View>
  );
});

const renderItem = ({ item }: ListRenderItemInfo<Item>) => <Row item={item} />;
const keyExtractor = (item: Item) => item.id;

export const FlashListShowcaseScreen = () => {
  const { spacing } = useTheme();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const search = query.trim().toLowerCase();

    return search ? items.filter(({ title }) => title.toLowerCase().includes(search)) : items;
  }, [query]);

  return (
    <Screen>
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <TextField label="Filter items" value={query} onChangeText={setQuery} maxLength={64} />
        <AppText variant="caption" accessibilityLiveRegion="polite">
          {data.length} results
        </AppText>
      </View>

      <AppList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<AppText style={{ padding: spacing.md }}>No matching items.</AppText>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({ row: { borderBottomWidth: StyleSheet.hairlineWidth } });
