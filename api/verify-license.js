export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { license_key } = req.body;

  const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: process.env.GUMROAD_PRODUCT_ID,
      license_key,
      api_key: process.env.GUMROAD_API_KEY
    })
  });

  const data = await response.json();

  if (data.success && data.purchase.subscription_cancelled_at === null) {
    return res.status(200).json({ authorized: true });
  }

  return res.status(401).json({ authorized: false });
}
