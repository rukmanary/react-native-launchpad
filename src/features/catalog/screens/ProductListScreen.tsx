import { View } from 'react-native';
import { AppList } from '@/shared/ui/AppList';
import { AppText } from '@/shared/ui/AppText';
import { Screen } from '@/shared/ui/Screen';
import { AsyncState } from '@/shared/ui/AsyncState';
import { useProducts } from '@/features/catalog/api/products';
import { useTheme } from '@/shared/theme/theme';

export const ProductListScreen = () => {
  const { products, loading, error, retry } = useProducts();
  const { spacing } = useTheme();

  return (
    <Screen>
      {loading || error ? (
        <AsyncState loading={loading} error={error} onRetry={retry} />
      ) : (
        <AppList
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<AsyncState empty />}
          renderItem={({ item }) => (
            <View style={{ padding: spacing.md }}>
              <AppText>{item.name}</AppText>
              <AppText>{item.price}</AppText>
            </View>
          )}
        />
      )}
    </Screen>
  );
};
