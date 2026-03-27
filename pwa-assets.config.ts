import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
	headLinkOptions: { preset: '2023' },
	preset,
	outDir: 'static/pwa',
	images: ['static/favicon.svg']
})
