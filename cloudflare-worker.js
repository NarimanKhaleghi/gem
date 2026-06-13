// Cloudflare Worker Proxy for Gemini AI
// Deploy this to Cloudflare Workers if you want to use your own proxy.
// It simply forwards requests to the Google Gemini API and passes CORS.

export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-goog-api-key, Authorization",
          },
        });
      }
  
      // Forward the request to Gemini API
      const targetUrl = new URL(url.pathname + url.search, "https://generativelanguage.googleapis.com");
      
      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow",
      });
  
      const response = await fetch(modifiedRequest);
  
      // Add CORS headers to the response
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;
    },
  };
