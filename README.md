# XauPutra Dashboard

Dashboard iOS 26 Style Liquid Glass untuk trading platform.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment Variables:**
   - Copy `.env.example` menjadi `.env`
   - Ganti `VITE_GITHUB_TOKEN` dengan token GitHub kamu:
   
   ```
   VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Run Development:**
   ```bash
   npm run dev
   ```

4. **Build:**
   ```bash
   npm run build
   ```

## Cara Mendapatkan GitHub Token

1. Login ke GitHub
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token dengan scope `repo`
4. Copy token dan paste ke file `.env`

## Cara Deploy

1. Build project: `npm run build`
2. Upload file `dist/index.html` ke hosting
3. Pastikan token di `.env` sudah benar sebelum build

## Fitur

- Login system dengan database GitHub
- Admin panel untuk manage users
- Upload/download EA scripts (.mq4/.mq5)
- Fully customizable content via Admin Panel
- Responsive iOS 26 Liquid Glass UI