import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
	resolve: {
		alias: {
			'@': `${path.resolve(__dirname, 'src')}`,
		},
	},

	build: {
		minify: true,
	},

	plugins: [
		vue(),
	],

	server: {
		port: 8084,
		proxy: {
			"^/current-list": {
				target: "http://localhost:8083"
			},
			"^/signup": {
				target: "http://localhost:8083"
			},
		},
	},
})