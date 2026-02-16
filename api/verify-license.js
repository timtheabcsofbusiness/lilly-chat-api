export default async function handler(req, res) {

  // ✅ Allow Webflow origin
  res.setHeader("Access-Control-Allow-Origin", "https://talkwithlilly.net");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-lilly-auth"
  );

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { license_key } = req.body;

  if (!license_key) {
    return res.status(400).json({ error: "License key required" });
  }

  try {
    const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: process.env.GUMROAD_PRODUCT_ID,
        license_key
      })
    });

    const data = await response.json();

    if (
      data.success &&
      data.purchase &&
      data.purchase.subscription_cancelled_at === null
    ) {
      return res.status(200).json({
        authorized: true,
        token: process.env.LILLY_CHAT_SECRET,
        full_name: data.purchase.full_name || "",
        license_key: data.purchase.license_key
      });
    }

    return res.status(401).json({ authorized: false });

  } catch (err) {
    return res.status(500).json({ error: "Verification failed" });
  }
}
