import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath, URL } from 'node:url'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../ui-kit/stories/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@ui-kit': fileURLToPath(new URL('../ui-kit', import.meta.url)),
          '@dashboard': fileURLToPath(new URL('../dashboard', import.meta.url)),
          '@legacy-redo': fileURLToPath(new URL('../legacy-redo', import.meta.url)),
          '@rules-test': fileURLToPath(new URL('../rules-test', import.meta.url)),
        },
      },
    })
  },
}

export default config
