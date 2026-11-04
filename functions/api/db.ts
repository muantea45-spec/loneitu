interface Env {
  LONEITU_KV?: KVNamespace;
}

// In-memory fallback across warm isolates
let cachedDbState: any = null;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    let data = null;

    if (context.env.LONEITU_KV) {
      data = await context.env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
    }

    if (!data && cachedDbState) {
      data = cachedDbState;
    }

    if (data) {
      return new Response(JSON.stringify({ success: true, data, source: context.env.LONEITU_KV ? 'kv' : 'memory' }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'No remote state stored yet' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const payload = await context.request.json();
    cachedDbState = payload;

    let kvSaved = false;
    if (context.env.LONEITU_KV) {
      await context.env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(payload));
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
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
