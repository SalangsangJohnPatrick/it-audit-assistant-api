import fetch from "node-fetch";

export async function callDeepSeek({ baseUrl, apiKey, model, bulletPoints }) {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that generates IT audit reports. Respond ONLY in strict JSON with the keys: issue, risk, recommendation, root_cause, management_response.",
        },
        {
          role: "user",
          content: `Generate the IT audit report based on these bullet points: ${bulletPoints}`,
        },
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content ||
    data?.output_text ||
    data?.text ||
    "";

  if (!content.trim()) {
    throw new Error("No content in DeepSeek response.");
  }

  const cleaned = content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return { json: JSON.parse(cleaned), raw: data };
  } catch (e) {
    throw new Error(
      `Failed to parse JSON: ${e.message}\nRaw content: ${content}`,
    );
  }
}
