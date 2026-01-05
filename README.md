# Diskon (Vue 3 + Vite)

Project kecil untuk mengelola daftar diskon. Berikut panduan singkat untuk menjalankan dan men-deploy ke Vercel.

## Menjalankan secara lokal

Install:

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Konfigurasi API base

Aplikasi memilih base URL API dengan prioritas:

1. `VITE_API_URL` (environment variable saat build/deploy)
2. `localStorage.getItem('apiUrl')` (nilai disimpan saat user menekan tombol "Terapkan")
3. `DEFAULT_API` di `src/settings.js`

Di Vercel, tambahkan environment variable `VITE_API_URL` jika ingin mengoverride URL secara global.

## Deploy ke Vercel

1. Push repository ke GitHub/GitLab/Bitbucket.
2. Di Vercel, pilih "New Project" dan impor repository.
3. Vercel akan mendeteksi build command `npm run build` dan output `dist` (lihat `vercel.json`).
4. (Optional) Atur `VITE_API_URL` di Environment Variables pada Vercel dashboard.

## Catatan

- Kode menyimpan perubahan API ke `localStorage` saat user menekan `Terapkan`.
- Untuk SPA routing fallback, `vercel.json` sudah menambahkan route ke `index.html`.

