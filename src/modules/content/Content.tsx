import { useWindowDimensions, Linking } from 'react-native';
import WebView, { type WebViewProps } from 'react-native-webview';
import RenderHTML from 'react-native-render-html';
import { AppText } from '@/shared/ui/AppText';
import { useTheme } from '@/shared/theme/theme';

export const isAllowedUrl = (value: string, origins: readonly string[]) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' && !url.username && !url.password && origins.includes(url.origin)
    );
  } catch {
    return false;
  }
};

export const AppWebView = ({
  url,
  allowedOrigins,
  onMessage,
  ...props
}: Omit<WebViewProps, 'source' | 'onShouldStartLoadWithRequest' | 'originWhitelist'> & {
  url: string;
  allowedOrigins: readonly string[];
}) => {
  const { colors } = useTheme();

  if (!isAllowedUrl(url, allowedOrigins)) throw new Error('Web origin not allowed');

  return (
    <WebView
      {...props}
      source={{ uri: url }}
      style={[{ backgroundColor: colors.surface }, props.style]}
      // Let our predicate reject navigation instead of sending unmatched URLs to the OS.
      originWhitelist={['*']}
      javaScriptEnabled={props.javaScriptEnabled ?? false}
      javaScriptCanOpenWindowsAutomatically={false}
      domStorageEnabled={false}
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      thirdPartyCookiesEnabled={false}
      mixedContentMode="never"
      setSupportMultipleWindows={false}
      onOpenWindow={undefined}
      onShouldStartLoadWithRequest={(request) =>
        (!('hasTargetFrame' in request) || request.hasTargetFrame !== false) &&
        isAllowedUrl(request.url, allowedOrigins)
      }
      onMessage={onMessage}
    />
  );
};

export const HtmlContent = ({
  html,
  allowedOrigins,
  onLinkError,
  contentWidth,
}: {
  html: string;
  allowedOrigins: readonly string[];
  onLinkError?: (error: unknown) => void;
  contentWidth?: number;
}) => {
  const { width } = useWindowDimensions();
  const { colors, spacing } = useTheme();
  const availableWidth = Math.max(1, contentWidth ?? width - 2 * spacing.lg);

  if (html.trim().length === 0) return <AppText tone="muted">No content</AppText>;

  return (
    <RenderHTML
      contentWidth={availableWidth}
      source={{ html }}
      baseStyle={{ color: colors.text }}
      tagsStyles={{ a: { color: colors.primary } }}
      ignoredDomTags={['script', 'iframe', 'object', 'embed', 'form']}
      renderersProps={{
        a: {
          onPress: (_event, url) => {
            if (isAllowedUrl(url, allowedOrigins))
              void Linking.openURL(url).catch((error) => onLinkError?.(error));
          },
        },
      }}
    />
  );
};
