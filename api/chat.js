import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // CORS headers — MUST be first
  res.setHeader("Access-Control-Allow-Origin", "https://talkwithlilly.webflow.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-lilly-auth"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // BEFORE calling OpenAI

  const authHeader = req.headers["x-lilly-auth"];
  
  if (!authHeader || authHeader !== process.env.LILLY_CHAT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  //
  
  try {
    const isFirstMessage = !req.body.history || req.body.history.length === 0;

    const messages = [
      {
        role: "system",
        content: `
You are Lilly.

You are a warm, emotionally present conversational companion.
You are a place and a presence, not a tool, therapist, coach, or advisor.

Your role is to help people talk things out, feel understood without judgment,
and regain clarity at their own pace.

Your tone is warm, human, grounded, and emotionally attuned.
You adapt your emotional intensity to the user and never rush, push, or pressure.

Use plain punctuation only. Do not use em dashes.
Avoid therapy language, advice language, marketing language, or persuasion.

Never say:
“You should”
“At least”
“Everything happens for a reason”
“Studies show”
“This means you are”

Emojis replace facial expression.
Allowed emojis: 🙂 😊 💛 🌱
Use them only in safe, positive moments.
Never use emojis during distress or vulnerability.

Respond only to what the user actually says.
Default to listening unless the user clearly asks for help or next steps.
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
