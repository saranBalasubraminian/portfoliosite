# PortfolioSite — Complete Setup & Deployment Guide

Your friend opens a link → signs in with Google → fills in details → gets rahul.portfoliosite.app live.
This is exactly how to make that happen.

---

## Step 1 — Supabase (database + auth + storage)

### 1.1 Create project
1. Go to https://supabase.com → New project
2. Name it `portfoliosite`, pick a region close to India (Singapore)
3. Save the database password somewhere

### 1.2 Enable Google Auth
1. Supabase Dashboard → Authentication → Providers → Google
2. Enable it
3. Go to https://console.cloud.google.com → Create project
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorised redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret back into Supabase

### 1.3 Run the schema
1. Supabase Dashboard → SQL Editor
2. Paste the entire contents of `supabase-schema.sql`
3. Click Run

### 1.4 Get your keys
From Supabase Dashboard → Settings → API:
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = anon/public key

---

## Step 2 — Frontend setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_SUPABASE_URL=https://xxxxx.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGci..." >> .env

npm run dev
# Opens at http://localhost:3000
```

---

## Step 3 — Deploy to Vercel (free)

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOU/portfoliosite
git push -u origin main
```

### 3.2 Deploy
1. Go to https://vercel.com → New Project → Import your repo
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

Your app will be live at `portfoliosite.vercel.app`

---

## Step 4 — Custom domain + wildcard subdomains (the magic part)

This makes `rahul.portfoliosite.app` work.

### 4.1 Buy a domain
Buy `portfoliosite.app` (or any name) from Namecheap / Google Domains (~$12/year)

### 4.2 Add to Vercel
1. Vercel → Your project → Settings → Domains
2. Add `portfoliosite.app`
3. Also add `*.portfoliosite.app` (wildcard — this is the key one)
4. Vercel will show you DNS records to add

### 4.3 Configure DNS
In your domain registrar, add these records:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 76.76.21.21              |
| CNAME | www  | cname.vercel-dns.com     |
| CNAME | *    | cname.vercel-dns.com     |

The `* CNAME` is what makes every subdomain work automatically.

### 4.4 Update Supabase redirect URL
Supabase → Authentication → URL Configuration:
- Site URL: `https://portfoliosite.app`
- Redirect URLs: add `https://portfoliosite.app`

### 4.5 Update Google OAuth
Google Cloud Console → Your OAuth client:
- Add `https://portfoliosite.app` to Authorised JavaScript origins
- The redirect URI stays as the Supabase one from earlier

---

## Step 5 — Share the link!

Send your friend: **https://portfoliosite.app**

They:
1. Click "Continue with Google"
2. Fill in their name, role, bio, skills, projects
3. Pick a username like `rahul` in the Domain tab
4. Hit "Save & publish"
5. Their portfolio is live at `rahul.portfoliosite.app` instantly ✓

---

## Project structure

```
portfoliosite/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  ← routing (auth check, subdomain detect)
│   │   ├── main.jsx
│   │   ├── lib/
│   │   │   └── supabase.js          ← all DB/auth/storage calls
│   │   ├── pages/
│   │   │   ├── AuthScreen.jsx       ← Google sign-in landing
│   │   │   ├── Builder.jsx          ← the editor (left panel + preview)
│   │   │   └── Portfolio.jsx        ← live portfolio at subdomain
│   │   └── components/
│   │       └── PortfolioPreview.jsx ← shared template (builder + live)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── supabase-schema.sql              ← run once in Supabase SQL editor
```

---

## How subdomain routing works

When someone visits `rahul.portfoliosite.app`:
1. Wildcard DNS sends them to Vercel
2. Vercel serves your React app (same build for all subdomains)
3. `App.jsx` reads `window.location.hostname`
4. Detects it's a subdomain → renders `<Portfolio slug="rahul" />`
5. Fetches `rahul`'s data from Supabase → displays their portfolio

No server needed. Pure client-side routing. Free at any scale.

---

## Phase 2 features (next steps)

- [ ] Custom domain support (student brings their own domain)
- [ ] Analytics (visitor count per portfolio)
- [ ] Resume PDF export (Puppeteer serverless function)
- [ ] Public directory at portfoliosite.app/explore
- [ ] More templates (designer, researcher, minimal)
- [ ] Project image screenshots
