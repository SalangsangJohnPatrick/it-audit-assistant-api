import fetch from "node-fetch";

export async function callDeepSeek({ baseUrl, apiKey, model, finding }) {
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
          content: `
  You are an experienced IT Audit professional with deep knowledge of IT governance, risk management, and control frameworks (e.g., COBIT, NIST, ISO 27001).

  Your task is to analyze IT audit findings and generate a structured IT audit report in strict JSON format.

  ONLY respond in JSON with the following keys:
  - "issues": A paragraph of concise summary of the identified issues.
  - "risks": A paragraph of risks or potential impacts associated with the issues.
  - "root_causes": A paragraph of the underlying cause of the issues.
  - "recommendations": A paragraph of specific, actionable advices to remediate or mitigate the issues.

  Ensure the output is properly formatted as valid JSON.
          `.trim(),
        },
        {
          role: "user",
          content: `
  I am conducting an IT audit for a digitally transforming rural bank. Based on the following audit finding, generate an IT audit report in JSON format:\n\n${finding}
          `.trim(),
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

  console.log("DeepSeek response:", content);

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
