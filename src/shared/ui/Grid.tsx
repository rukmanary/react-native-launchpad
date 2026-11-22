import { Children, isValidElement, type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/shared/theme/theme';

type Props = PropsWithChildren<ViewProps & { columns?: number; gap?: number }>;

export const Grid = ({ children, columns = 2, gap, style, ...props }: Props) => {
  const { spacing } = useTheme();
  const columnCount = Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 1;
  const gutter = gap !== undefined && Number.isFinite(gap) ? Math.max(0, gap) : spacing.sm;
  const width = `${100 / columnCount}%` as const;

  return (
    <View
      {...props}
      style={[styles.grid, { marginHorizontal: -gutter / 2, rowGap: gutter }, style]}
    >
      {Children.toArray(children).map((child, index) => (
        <View
          key={isValidElement(child) ? child.key : index}
          style={{ width, paddingHorizontal: gutter / 2 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
