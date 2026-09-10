# AGENTS.md: Operational Protocols & Architectural Rules for Forge

## 1. CRITICAL PROTOCOL: Dev Server vs Production Build / Deploy
> **WARNING**: `npm run build` or `vercel --prod` must NEVER be run while `npm run dev` is actively running.
> 
> - **Failure Mechanism**: Next.js shares the internal `.next/` directory between dev compilation and production build traces. Running both simultaneously causes Windows file locks and cache race conditions, corrupting the static asset map. This immediately leads to `/_next/static/css/app/layout.css` returning **HTTP 503 (Service Unavailable)** and completely stripping all Tailwind CSS styling in the browser.
> - **Mandatory Sequence**:
>   1. **Stop Dev Server**: Kill the process on port 3006 or cancel the dev task.
>   2. **Run Build / Deploy**: Execute `npm run build` and/or `npx vercel --prod --yes`.
>   3. **Clean Cache & Restart Dev Server**: If development continues, remove `.next` if needed and restart `npm run dev`.
>   4. **Automated Styling Check**: Verify `curl` or `fetch` on `http://localhost:3006/_next/static/css/app/layout.css` returns **HTTP 200 OK**.

## 2. Branding Guidelines
- Product Name: **Forge** (Never use competitor name "VibeCoder" or "FORGE EDITION" badge).
- Base Domain: `forge.dev`.
- Production Domain: `https://forge-app-engine.vercel.app`.
- Session Cookie: `forge_session`.

## 3. Autonomous Agentic Engine (ReAct Loop)
- Must execute physical tools on disk (`workspaces/[sessionId]/`).
- Must run real shell commands (`node --check`, `node test.mjs`).
- Must provide real input and output in tool call details so the `<pre>` containers display complete data.
