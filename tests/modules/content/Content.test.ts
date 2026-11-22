import { isAllowedUrl } from '@/modules/content/Content';

jest.mock('react-native-webview', () => () => null);
jest.mock('react-native-render-html', () => () => null);

const origins = ['https://example.com'];

describe('WebView origin checks', () => {
  it('allows a path and a fragment on an explicitly trusted HTTPS origin', () => {
    expect(isAllowedUrl('https://example.com/articles/one#heading', origins)).toBe(true);
  });

  it.each([
    'http://example.com',
    'https://example.com.invalid',
    'https://example.com:9443',
    'https://sample@example.com',
    'https://example.com@evil.invalid',
    'example.com',
    'about:blank',
    'file:///sample.html',
  ])('rejects %s', (url) => {
    expect(isAllowedUrl(url, origins)).toBe(false);
  });
});
