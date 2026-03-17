export default async (req) => {
  const url = new URL(req.url);
  const currency = url.searchParams.get("currency");
  const cacheKey = `rates:${currency}`;
  const TTL = 3600;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  async function redisGet(key) {
    const res = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const data = await res.json();
    return data.result;
  }

  async function redisSet(key, value, ttl) {
    await fetch(`${redisUrl}/set/${key}/${encodeURIComponent(JSON.stringify(value))}?EX=${ttl}`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
  }
// CACHE
  const cached = await redisGet(cacheKey);
  if (cached) {
    return new Response(cached, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${currency}`
  );
  const data = await response.json();

  await redisSet(cacheKey, data, TTL);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

export const config = { path: "/api/rates" };