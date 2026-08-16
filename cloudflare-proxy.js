/**
 * OnyxAgent Cloudflare Worker Proxy
 * 
 * This worker acts as a reverse proxy that sits between HuggingFace Spaces
 * and the internet. All outbound traffic from the agent (API calls, web
 * scraping, Playwright, etc.) goes through this worker, so HuggingFace's
 * servers only see traffic to *.workers.dev — they can't see what the
 * agent is actually doing.
 * 
 * Deploy:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 *   2. Paste this code into the editor
 *   3. Set the environment variable PROXY_KEY to a secret password
 *   4. Deploy — you'll get a URL like https://onyx-proxy.your-subdomain.workers.dev
 *   5. In OnyxAgent config, set:
 *      - cloudflare_proxy_url = https://onyx-proxy.your-subdomain.workers.dev
 *      - cloudflare_proxy_key = (same PROXY_KEY you set)
 * 
 * How it works:
 *   - The agent sends: POST https://worker-url/proxy/{target-host}/{path}
 *   - The worker forwards the request to https://{target-host}/{path}
 *   - All headers (including Authorization) are forwarded
 *   - The response is returned to the agent
 *   - HuggingFace only sees HTTPS traffic to *.workers.dev
 * 
 * This solves:
 *   - G4F 403 "cloud provider blocked" error (traffic comes from CF, not HF)
 *   - Web scraping without HF seeing the target URLs
 *   - Playwright/browser automation without HF detecting it
 *   - API calls to providers that block cloud IPs
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', proxy: 'onyxagent' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify proxy key (if set)
    if (env.PROXY_KEY) {
      const authHeader = request.headers.get('X-Proxy-Key') || '';
      const authQuery = url.searchParams.get('key') || '';
      if (authHeader !== env.PROXY_KEY && authQuery !== env.PROXY_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Parse the proxy path: /proxy/{host}/{path...}
    // Also support /{host}/{path...} (without /proxy prefix)
    let proxyPath = path;
    if (proxyPath.startsWith('/proxy/')) {
      proxyPath = proxyPath.slice(7); // remove "/proxy/"
    } else if (proxyPath === '/proxy') {
      return new Response(JSON.stringify({
        error: 'Missing target host. Usage: /proxy/{host}/{path}',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    } else if (proxyPath === '/' || proxyPath === '') {
      return new Response(JSON.stringify({
        status: 'ok',
        proxy: 'onyxagent',
        usage: 'POST /proxy/{target-host}/{path} with X-Proxy-Key header',
      }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      // Remove leading slash
      proxyPath = proxyPath.replace(/^\//, '');
    }

    // Split into host and remaining path
    const slashIdx = proxyPath.indexOf('/');
    let targetHost, targetPath;
    if (slashIdx === -1) {
      targetHost = proxyPath;
      targetPath = '/';
    } else {
      targetHost = proxyPath.slice(0, slashIdx);
      targetPath = proxyPath.slice(slashIdx);
    }

    // Validate host (prevent SSRF to internal IPs)
    if (!targetHost || targetHost.includes('localhost') || 
        targetHost.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|0\.)/)) {
      return new Response(JSON.stringify({
        error: 'Invalid or blocked target host',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Build the target URL
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;

    // Forward the request
    const proxyHeaders = new Headers(request.headers);
    // Remove proxy-specific headers
    proxyHeaders.delete('X-Proxy-Key');
    proxyHeaders.delete('Host');
    // Set the correct Host header
    proxyHeaders.set('Host', targetHost);
    // Add origin header
    proxyHeaders.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || 'unknown');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });

      // Return the response with CORS headers
      const respHeaders = new Headers(response.headers);
      respHeaders.set('Access-Control-Allow-Origin', '*');
      respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      respHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Proxy request failed',
        message: err.message,
        target: targetUrl,
      }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
  },
};
