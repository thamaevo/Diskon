import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/', // atau './' untuk relatif jika perlu
  plugins: [vue()]
})
