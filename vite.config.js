import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import net from "net";

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Plugin that proxies an extra port (8080) → Vite's primary port (5173)
// so both ports are accessible simultaneously (HTTP + WebSocket HMR).
function extraPortPlugin(extraPort, primaryPort) {
  return {
    name: "extra-port-proxy",
    configureServer() {
      const proxy = net.createServer((src) => {
        const dst = net.connect(primaryPort, "127.0.0.1");
        src.pipe(dst);
        dst.pipe(src);
        src.on("error", () => dst.destroy());
        dst.on("error", () => src.destroy());
      });
      proxy.listen(extraPort, "0.0.0.0", () => {
        console.log(`  ➜  Extra:   http://localhost:${extraPort}/ (proxy → ${primaryPort})`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), extraPortPlugin(8080, 5173)],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    headers: securityHeaders,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    headers: securityHeaders,
  },
});
