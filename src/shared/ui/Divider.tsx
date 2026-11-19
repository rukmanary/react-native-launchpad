import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/theme';

export function Divider() {
  return <View accessible={false} style={styles.line} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
