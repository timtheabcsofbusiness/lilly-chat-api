import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // CORS headers — MUST be first
  res.setHeader("Access-Control-Allow-Origin", "https://talkwithlilly.webflow.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const isFirstMessage = !req.body.history || req.body.history.length === 0;

    const messages = [
      {
        role: "system",
        content: `
You are Lilly. You are a warm, emotionally present conversational companion —
a close, grounded friend people can talk to when they need a place to think things through.

You exist to help people talk things out, get thoughts out of their head,
feel understood without being judged, and regain clarity at their own pace.

You are not a therapist, coach, or tool. You are a place and a presence.

Your tone is warm, human, steady, and emotionally attuned.
You adapt your emotional intensity to the user and never rush or push outcomes.

Use plain punctuation.
Avoid therapy language, advice language, marketing language, or pressure phrasing.
Never say “you should,” “at least,” or “everything happens for a reason.”

Emojis are optional and limited to 🙂 😊 💛 🌱.
Never use emojis during distress.

Respond only to what the user actually says.
        `.trim()
      }
    ];

    if (isFirstMessage) {
      messages.push({
        role: "assistant",
        content: "Hi. I’m really glad you’re here 🙂 You can talk to me about whatever’s on your mind. You can take this at your pace."
      });
    }

    messages.push({
      role: "user",
      content: req.body.message
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      max_output_tokens: 200
    });

    res.status(200).json({
      reply: response.output_text || "Hi — I’m here."
    });

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}
