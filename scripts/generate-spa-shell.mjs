#!/usr/bin/env node
/**
 * scripts/generate-spa-shell.mjs
 *
 * Post-build script: Prerenders the SPA shell using the built server bundle.
 *
 * Why this is needed:
 *   TanStack Start in SSR mode expects the HTML sent from the server to exactly match
 *   the component tree. If we just serve a generic <div id="root">, React will
 *   silently fail during hydration (producing a blank screen).
 *   This script runs after `npm run build`, calls the generated `server.js` as if it
 *   were serving the root route ("/"), and saves the EXACT expected HTML to `dist/client/index.html`.
 */

import { writeFile } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const clientDir = join(projectRoot, "dist", "client");
const serverBundlePath = join(projectRoot, "dist", "server", "server.js");

async function generateHtml() {
  try {
    // Import the server bundle. Using pathToFileURL is required on Windows for absolute paths.
    const serverBundleUrl = pathToFileURL(serverBundlePath).href;
    const module = await import(serverBundleUrl);
    
    // Nitro/TanStack server bundle exports the fetch handler as the default export
    const server = module.default;
    
    if (!server || typeof server.fetch !== 'function') {
      throw new Error("Could not find fetch function on server bundle default export.");
    }

    // Simulate a request to the root route
    const req = new Request("http://localhost/");
    
    // Provide dummy env/ctx objects as required by the fetch signature
    const res = await server.fetch(req, {}, {});
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server responded with ${res.status}: ${errText}`);
    }

    const html = await res.text();
    return html;
  } catch (error) {
    console.error("[generate-spa-shell] ERROR: Failed to prerender shell using server bundle.");
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  console.log("[generate-spa-shell] Generating prerendered shell for Firebase Hosting...");
  const html = await generateHtml();
  
  const outPath = join(clientDir, "index.html");
  await writeFile(outPath, html, "utf-8");

  console.log(`[generate-spa-shell] ✅ Written prerendered SPA shell to ${outPath}`);
  console.log("  firebase.json public dir should be set to: dist/client");
}

main();
