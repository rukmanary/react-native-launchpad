import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';
import { Screen } from '../../../shared/ui/Screen';
import { AsyncState } from '../../../shared/ui/AsyncState';
import { productsQuery } from '../api/products';
export function ProductListScreen() {
  const query = useQuery(productsQuery());
  return (
    <Screen>
      {query.isPending || query.isError ? (
        <AsyncState
          loading={query.isPending}
          error={query.error}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <FlashList
          data={query.data}
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
