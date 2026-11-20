import { useWindowDimensions, Linking } from 'react-native';
import WebView, { type WebViewProps } from 'react-native-webview';
import RenderHTML from 'react-native-render-html';

export function isAllowedUrl(value: string, origins: readonly string[]) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && origins.includes(url.origin);
  } catch {
    return false;
  }
}

export function AppWebView({
  url,
  allowedOrigins,
  onMessage,
  ...props
}: Omit<WebViewProps, 'source' | 'onShouldStartLoadWithRequest' | 'originWhitelist'> & {
  url: string;
  allowedOrigins: readonly string[];
}) {
  if (!isAllowedUrl(url, allowedOrigins)) throw new Error('Web origin not allowed');
  return (
    <WebView
      {...props}
      source={{ uri: url }}
      originWhitelist={[...allowedOrigins]}
      javaScriptEnabled={props.javaScriptEnabled ?? false}
      domStorageEnabled={false}
      allowFileAccess={false}
      mixedContentMode="never"
      setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={(request) => isAllowedUrl(request.url, allowedOrigins)}
      onMessage={onMessage}
    />
  );
}

export function HtmlContent({
  html,
  allowedOrigins,
  onLinkError,
}: {
  html: string;
  allowedOrigins: readonly string[];
  onLinkError?: (error: unknown) => void;
}) {
  const { width } = useWindowDimensions();

  return (
    <RenderHTML
      contentWidth={width - 48}
      source={{ html }}
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
}
