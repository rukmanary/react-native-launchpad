import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';
import { Screen } from '../../../shared/ui/Screen';
import { AsyncState } from '../../../shared/ui/AsyncState';
import { useProducts } from '../api/products';

export function ProductListScreen() {
  const { products, loading, error, retry } = useProducts();

  return (
    <Screen>
      {loading || error ? (
        <AsyncState loading={loading} error={error} onRetry={retry} />
      ) : (
        <FlashList
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<AsyncState empty />}
          renderItem={({ item }) => (
            <View style={{ padding: 16 }}>
              <Text>{item.name}</Text>
              <Text>{item.price}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
