# thumb.to — System Architecture & Product Specification

> **Tagline:** The Interactive Creator Remote & Live Stream Companion.  
> **Mission:** Transform passive audiences into active participants with tactile, one-handed mobile remotes, instant tipping, and real-time livestream overlays.

---

## 1. Product Overview

`thumb.to` solves the fragmentation of creator tools. Instead of maintaining separate services for link trees, tipping jars, live polling, and stream chat, a creator shares one dynamic link:

$$\text{thumb.to/@creator}$$

The page automatically adapts based on whether the creator is **Offline** or **Live**:

```
┌────────────────────────────────────────────────────────┐
│                        THUMB.TO                        │
│             The Interactive Creator Remote             │
├───────────────────────────┬────────────────────────────┤
│       EVERYDAY MODE       │         LIVE MODE          │
│   (Bio & Support Hub)     │    (The Stream Remote)     │
├───────────────────────────┼────────────────────────────┤
│ • Thumb to Tip (Haptic)   │ • Live Hype Gauge          │
│ • Thumb to Request / AMA  │ • Instant Flash Polls      │
│ • Pinned Links & Media    │ • Thumb Chat & Emotes      │
│ • Socials & Communities   │ • Super-Thumb Paid Chat    │
│ • Mobile-First Ergonomics │ • Transparent OBS Overlay  │
└───────────────────────────┴────────────────────────────┘
```

---

## 2. Core User Experiences

### 2.1 The Viewer / Fan Experience (Mobile-First Web)
* **Zero Install & Instant Load:** Loads in $< 500\text{ms}$ in mobile Safari / Chrome via QR code or bio link.
* **Ergonomic Partitioning:**
  * **Top 40% (Glance Zone):** Creator profile, stream status, live video embed (optional), or live poll question.
  * **Bottom 60% (Active Thumb Zone):** Big tactile touch targets ($\ge 52\text{px}$), arc dials, steppers, and reaction pills.
* **Tactile Haptic Feedback:** Vibrations triggered via the HTML5 Web Vibration API (`navigator.vibrate`) for every slider tick, vote cast, and tip confirmed.
* **Instant Payments:** Seamless Apple Pay, Google Pay, and card processing powered by Stripe Payment Request API—no manual card typing.

### 2.2 The Livestream Experience (OBS / Streamlabs Overlay)
* Creators receive a unique, secret overlay URL: `thumb.to/overlay/:token`.
* The overlay is added as a transparent **Browser Source** in OBS / Streamlabs.
* **Live Features on Screen:**
  * **Dynamic Hype Meter:** Fills up with neon particle effects as viewers pump their screens.
  * **Animated Flash Polls:** Displays live percentage bars that update smoothly via 60fps CSS transitions.
  * **Floating Reaction Bursts:** Fan emotes bubble up on the screen in real-time.
  * **Super-Thumb Banners:** Pinned paid highlight messages with customizable sound alerts.

### 2.3 The Creator Dashboard
* Mobile and desktop management console.
* Toggle **Live Mode** on/off with 1 click.
* Launch a flash poll in 10 seconds (presets or custom questions).
* Stripe Connect onboarding for instant bank payouts.
* Analytics: Profile visits, tip volume, live voter count, and top supporters.

---

## 3. Technology Stack & Deployment

Designed for native hosting on a self-hosted VPS through **Coolify** in a single multi-stage Docker container.

### 3.1 Stack Breakdown
* **Runtime & Language:** Node.js (LTS) + TypeScript
* **Backend Framework:** **Fastify**
  * `@fastify/websocket` for low-latency bidirectional real-time events.
  * `@fastify/rate-limit` for DDoS and spam protection.
  * `@fastify/helmet` for strict Content-Security-Policy (CSP) headers.
  * `@fastify/cookie` + secure session tokens.
* **Database & ORM:** **PostgreSQL** + **Drizzle ORM** (type-safe, zero overhead).
* **Frontend:** **Vite + React (TypeScript)**
  * Vanilla CSS with modern tokens, dark glassmorphism, and responsive ergonomics.
  * Lucide Icons for crisp, lightweight iconography.
  * PWA manifest for 1-tap "Add to Home Screen".
* **Payments:** Stripe Connect (Standard onboarding for 0% platform liability and automated tax/KYC).

---

## 4. Security Architecture

1. **Payment Security:**
   * Fully PCI-DSS compliant by isolation: raw credit card details never touch `thumb.to` servers.
   * All transactions processed through Stripe Elements / Payment Request Button.
   * Stripe Webhooks validated using cryptographic signatures (`stripe.webhooks.constructEvent`).

2. **Stream Injection & XSS Defense:**
   * All viewer-generated chat messages and Super-Thumb notes pass through strict sanitization before broadcast to WebSockets.
   * Overlay pages enforce strict HTML sanitization to prevent script execution on the creator's live stream.

3. **Overlay Token Protection:**
   * OBS overlays use cryptographically secure UUIDv4 / nanoid tokens.
   * Tokens can be rotated with 1 click if exposed on stream.

4. **Rate Limiting & Anti-Spam:**
   * WebSocket message rate limits (maximum 10 reaction bursts per second per IP).
   * Strict one-vote-per-poll enforcement using session identity and IP heuristics.
   * Fastify rate-limiting on sensitive endpoints (`/api/auth`, `/api/stripe`, `/api/polls`).

---

## 5. Monetization Strategy

| Tier | Price | Platform Fee | Features |
| :--- | :--- | :--- | :--- |
| **Free** | $0/mo | 5% on tips & paid chats | Unlimited bio links, basic tip jar, up to 25 live poll voters, `thumb.to` badge |
| **Pro Creator** | $12 – $15/mo | **0% platform fee** | Unlimited live poll voters, transparent OBS overlays, custom branding & colors, custom subdomain, email export |

---

## 6. Project Roadmap

* **Phase 1: Project Scaffolding & Core Architecture**
  * Root workspace setup (Fastify + Vite React + Drizzle).
  * Multi-stage `Dockerfile` and `docker-compose.yml` for Coolify.
  * PostgreSQL schema definition (Creators, Links, Tips, Polls, Sessions).
* **Phase 2: Everyday Remote (Mobile Viewer Experience)**
  * Tactile creator profile (`thumb.to/@username`).
  * Arc dial / stepper for tipping with haptic feedback.
  * Stripe Connect integration & payment flow.
* **Phase 3: Real-Time Live Mode & WebSockets**
  * Room-based WebSocket server (`@fastify/websocket`).
  * Live Hype Gauge and Flash Poll controller.
  * Thumb Chat and Floating Emote Bursts.
* **Phase 4: OBS Transparent Stream Overlay**
  * Real-time graphics engine for OBS browser source.
  * Sound alerts and animated Super-Thumb banners.
* **Phase 5: Creator Studio & Monetization Tiers**
  * Creator dashboard, live session switcher, poll launcher.
  * Pro subscription billing via Stripe Billing.
