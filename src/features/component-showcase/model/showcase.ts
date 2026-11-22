import type { ComponentType } from 'react';
import showcaseModules from '@/config/showcase-modules.json';

type OptionalShowcaseId = keyof typeof showcaseModules;

export type CoreShowcaseId = 'forms' | 'overlays' | 'list';
export type ShowcaseId = CoreShowcaseId | OptionalShowcaseId;

export type ShowcaseScreenLoaders = Partial<Record<OptionalShowcaseId, () => ComponentType>>;

export const coreShowcaseScreens: Record<CoreShowcaseId, () => ComponentType> = {
  forms: () =>
    require('@/features/component-showcase/screens/FormsShowcaseScreen').FormsShowcaseScreen,
  overlays: () =>
    require('@/features/component-showcase/screens/OverlaysShowcaseScreen').OverlaysShowcaseScreen,
  list: () =>
    require('@/features/component-showcase/screens/FlashListShowcaseScreen')
      .FlashListShowcaseScreen,
};

export type ShowcaseEntry<Id extends ShowcaseId = ShowcaseId> = {
  id: Id;
  title: string;
  components: readonly string[];
  optionalModule?: OptionalShowcaseId;
};

export const foundationComponents = [
  'Text',
  'View',
  'Toggle',
  'Card',
  'Button',
  'Checkbox',
  'Radio',
  'Chip',
  'Badge',
  'Divider',
  'Expandable',
  'Floating Button',
  'Grid',
  'Header',
  'Footer',
  'Steps',
  'Progress Bar',
  'Loading',
  'Skeleton',
  'Slider',
  'Avatar',
] as const;

export const coreShowcaseEntries: readonly ShowcaseEntry<CoreShowcaseId>[] = [
  {
    id: 'forms',
    title: 'Forms and search',
    components: ['Form', 'Text Field', 'Dropdown', 'Search Bar'],
  },
  {
    id: 'overlays',
    title: 'Dialogs and notifications',
    components: [
      'Modal',
      'Custom Alert',
      'Confirm Dialog',
      'Network Error Modal',
      'Toast and Snackbar',
    ],
  },
  {
    id: 'list',
    title: 'FlashList',
    components: ['FlashList with 1,000 searchable items'],
  },
];

export const optionalShowcaseEntries = Object.entries(showcaseModules).map(
  ([id, { title, components }]): ShowcaseEntry<OptionalShowcaseId> => ({
    id: id as OptionalShowcaseId,
    title,
    components,
    optionalModule: id as OptionalShowcaseId,
  }),
);
