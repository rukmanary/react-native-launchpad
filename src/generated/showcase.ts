import type { ShowcaseScreenLoaders } from '@/features/component-showcase';

export const optionalShowcaseScreens: ShowcaseScreenLoaders = {
  ui: () => require('@/modules/ui/showcase').UiShowcaseScreen,
  media: () => require('@/modules/media/showcase').MediaShowcaseScreen,
  content: () => require('@/modules/content/showcase').ContentShowcaseScreen,
  graphics: () => require('@/modules/graphics/showcase').GraphicsShowcaseScreen,
  camera: () => require('@/modules/camera/showcase').CameraShowcaseScreen,
  location: () => require('@/modules/location/showcase').LocationShowcaseScreen,
};
