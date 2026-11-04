interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  LONEITU_KV?: {
    get: (key: string, type: 'json' | 'text') => Promise<any>;
    put: (key: string, value: string) => Promise<void>;
  };
}

let inMemoryFallback: any = null;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/db') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      if (request.method === 'GET') {
        let data = null;
        if (env.LONEITU_KV) {
          data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
        }
        if (!data && inMemoryFallback) {
          data = inMemoryFallback;
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        });
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          inMemoryFallback = body;
          let kvSaved = false;
          if (env.LONEITU_KV) {
            await env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(body));
            kvSaved = true;
          }
          return new Response(JSON.stringify({ success: true, kvSaved }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    }

    return env.ASSETS.fetch(request);
  },
};
