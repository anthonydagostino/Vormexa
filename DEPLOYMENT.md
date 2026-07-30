# Deploying Vormexa

A step-by-step guide to getting Vormexa live on the web. No server to manage —
it's a static site, so hosting is cheap (often free) and there's nothing to
babysit.

Everything below is done in a browser. You'll need a credit card only if you add
a custom domain or turn on payments; the hosting itself starts free.

---

## What you need first

- ✅ The code on GitHub (already done — it's on your `Vormexa` repo).
- A free **[Vercel](https://vercel.com)** account (sign up with your GitHub login).
- _(Optional)_ A domain name if you want `vormexa.app` instead of a `*.vercel.app` URL.

> **Why Vercel for step one?** It reads the `vercel.json` in this repo and sets
> the special security headers Vormexa needs — with zero configuration. It's the
> fastest way to a working URL. (For lower bandwidth cost once you have real
> traffic, see [Cloudflare, at the bottom](#alternative-cloudflare-pages-cheaper-at-scale).)

---

## Part 1 — Get it live (about 5 minutes)

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Click **Add New… → Project**.
3. Find your **`Vormexa`** repository in the list and click **Import**.
   - If you don't see it, click **Adjust GitHub App Permissions** and grant
     Vercel access to the repo.
4. On the configure screen, Vercel auto-detects **Vite**. Leave everything as-is:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build` (already set by `vercel.json`)
   - **Output Directory:** `dist`
5. **Important — pick the branch.** Under **Git Branch**, choose
   `claude/vormexa-media-editing-wabl5u` for a first test deploy, **or** merge that
   branch into `main` first (recommended) and deploy `main`. See
   [Part 4](#part-4--merge-to-main-recommended).
6. Click **Deploy**. Wait ~1–2 minutes while it installs, builds, and publishes.
7. When it finishes you'll get a live URL like `https://vormexa-xyz.vercel.app`.
   Click **Visit**. 🎉

That's your app, live on the internet.

---

## Part 2 — Check it actually works

Open your new URL and confirm:

1. The landing page loads with the "Edit video, photos, audio & PDFs" hero.
2. Click **Open the app** → you see the grid of 20+ tools.
3. Open **Compress Image**, drop in a photo, and run it — you should get a
   smaller file back. (This proves the on-device engine is working.)
4. Try **Compress Video** — the first run downloads the engine (a one-time
   ~30 MB), then encodes. If it works, everything works.

If a tool ever says the engine couldn't load, it's almost always the security
headers — Vercel sets them from `vercel.json` automatically, so this should just
work. (Details: the app needs `Cross-Origin-Opener-Policy` and
`Cross-Origin-Embedder-Policy` headers, already configured.)

---

## Part 3 — Add your domain (optional)

1. Buy a domain (e.g. from **Cloudflare Registrar**, **Namecheap**, or **Porkbun**).
2. In your Vercel project → **Settings → Domains → Add**, type your domain.
3. Vercel shows you DNS records to add. Copy them into your domain registrar's
   DNS settings (Vercel has a copy-paste guide per registrar).
4. Wait for it to verify (minutes to an hour). Vercel issues the HTTPS
   certificate automatically.

---

## Part 4 — Merge to `main` (recommended)

Right now the finished work lives on the branch
`claude/vormexa-media-editing-wabl5u`. For a clean setup, merge it into `main` so
that's your production branch:

1. On GitHub, open the repo → you'll see a prompt to **Compare & pull request**
   for the branch (or go to **Pull requests → New**).
2. Base = `main`, compare = `claude/vormexa-media-editing-wabl5u`. Create the PR.
3. The **CI checks** (tests, lint, build) run automatically — wait for the green
   check, then **Merge**.
4. In Vercel → **Settings → Git**, set the **Production Branch** to `main`.

From then on, every push to `main` auto-deploys. Every PR gets its own preview
URL.

> I can open this pull request for you — just ask.

---

## Part 5 — Turn on payments (when you're ready to charge)

The app runs perfectly as a free product with no payment setup. When you want to
sell Pro:

1. Create a **[Lemon Squeezy](https://www.lemonsqueezy.com/)** account + store.
2. Add a **"Vormexa Pro"** product and **enable license keys** on it.
3. Copy the product's **checkout URL** (Share → Copy link).
4. In Vercel → **Settings → Environment Variables**, add:
   - Name: `VITE_LS_CHECKOUT_URL`  Value: _(your checkout URL)_
5. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy). The Pricing page and
   in-app upgrade buttons now take real payments.

Full explanation is in the README under **"Turning on payments"**.

---

## Alternative: Cloudflare Pages (cheaper at scale)

Cloudflare gives **free, unmetered bandwidth**, which matters once you have lots
of visitors (each new visitor downloads the ~30 MB engine once). The catch:
Cloudflare Pages has a **25 MB per-file limit**, and the engine `.wasm` is ~32 MB,
so it needs one extra step.

- **Easy path:** deploy to Vercel now (above). Only move to Cloudflare if
  bandwidth bills become a concern.
- **Cost-optimized path:** host the app on **Cloudflare Pages** and serve the two
  `public/ffmpeg/*.wasm` files from **Cloudflare R2** (no size limit, free
  egress) with `Cross-Origin-Resource-Policy: cross-origin` headers, then point
  the engine loader (`src/lib/ffmpeg.ts`, `CORE_BASE`) at that R2 URL.

> This is a ~20-minute change — ask me and I'll wire the loader up for R2.

---

## Post-deploy checklist

- [ ] Live URL loads and a tool runs end-to-end
- [ ] (Optional) Custom domain connected with HTTPS
- [ ] Branch merged to `main`, production branch set
- [ ] (When selling) `VITE_LS_CHECKOUT_URL` set and redeployed
- [ ] Add privacy-friendly analytics (Plausible / Cloudflare Web Analytics —
      **not** Google Analytics, which contradicts the privacy promise)
