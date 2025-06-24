import axios from "axios";


// SMART REPLY - Using google/flan-t5-small
export const getSmartReplies = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Valid message is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly person replying to chat messages casually. Keep responses short, human, and conversational — like something you'd actually say over text. Avoid sounding robotic or overly formal.",
          },
          {
            role: "user",
            content: `Give 3 natural, casual replies someone might send in response to this message:\n"${message}"\nEach reply should be on a separate line starting with a number.`,
          },
        ],
        temperature: 0.7, // slight creativity
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || "";

    const replies = text
      .split(/\n?\d+\.\s+/) // split by numbered lines
      .map((r) => r.replace(/^["'\s]+|["'\s]+$/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return res.status(200).json({ replies });
  } catch (err) {
    console.error("Smart Reply Error:", err.response?.data || err.message);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Failed to generate smart replies" });
    }
  }
};


// TONE DETECTION - Using j-hartmann/emotion-english-distilroberta-base
export const detectTone = async (message) => {
  if (!message || typeof message !== "string") {
    throw new Error("Valid message is required");
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `Classify the emotional tone of this message: "${message}". Choose one from: joy, sadness, anger, fear, surprise, or neutral. Respond only with the tone label.`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content
      ?.trim()
      .toLowerCase();
    const tone = raw?.match(/\b(joy|sadness|anger|fear|surprise|neutral)\b/);

    if (!tone) throw new Error(`Unexpected tone response: "${raw}"`);
    return tone[1];
  } catch (err) {
    console.error("Tone Detection Error:", err.response?.data || err.message);
    throw new Error("Failed to detect tone");
  }
};
