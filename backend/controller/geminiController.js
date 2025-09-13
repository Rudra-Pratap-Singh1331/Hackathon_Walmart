import geminiResponse from "../gemini.js";

export const askToAssistant = async (req, res) => {
  try {
    const { transcript } = req.body;
    const result = await geminiResponse(transcript);
    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({ response: "Sorry, I can't understand." });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    res.json(gemResult); // ✅ send it to client
  } catch (error) {
    console.log("Gemini error:", error.message);
    res.status(500).json({ error: "Internal Server Error" }); // ✅ handle server crash
  }
};