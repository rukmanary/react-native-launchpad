import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppWebView, HtmlContent } from '@/modules/content/Content';
import { useTheme } from '@/shared/theme/theme';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';

const exampleOrigin = 'https://example.com';
const allowedOrigins = [exampleOrigin];
const sampleHtml =
  '<h2>Welcome to the HTML renderer</h2><p>This local sample includes <strong>bold text</strong>, a list, and a link.</p><ul><li>No JavaScript</li><li>Theme-aware typography</li></ul><p><a href="https://example.com/">Open Example Domain</a></p>';

export const ContentShowcaseScreen = () => {
  const { colors, radii, spacing } = useTheme();
  const [webVisible, setWebVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [linkError, setLinkError] = useState(false);

  return (
    <Screen style={{ padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="heading">WebView and rich text</AppText>
      <Button
        variant="secondary"
        label={webVisible ? 'Show local HTML' : 'Open website in WebView'}
        onPress={() => setWebVisible((visible) => !visible)}
      />
      <View style={[styles.content, { borderRadius: radii.lg, backgroundColor: colors.surface }]}>
        {webVisible ? (
          <AppWebView
            key={attempt}
            url={exampleOrigin}
            allowedOrigins={allowedOrigins}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator
                accessibilityLabel="Loading website"
                color={colors.primary}
                style={styles.center}
              />
            )}
            renderError={() => (
              <View style={[styles.center, { padding: spacing.md, gap: spacing.sm }]}>
                <AppText tone="danger">The website could not be loaded.</AppText>
                <Button label="Retry" onPress={() => setAttempt((value) => value + 1)} />
              </View>
            )}
          />
        ) : (
          <View style={{ padding: spacing.md }}>
            <HtmlContent
              allowedOrigins={allowedOrigins}
              html={sampleHtml}
              onLinkError={() => setLinkError(true)}
            />
            {linkError && <AppText tone="danger">The browser could not open the link.</AppText>}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, overflow: 'hidden' },
  center: { flex: 1, justifyContent: 'center' },
});
