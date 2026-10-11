import { runCompanyAnalysis } from "../src/server/analysisEngine";

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // body remains string
      }
    }

    const query = body?.query;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Search query is required in request body: { query: '...' }" });
      return;
    }

    const report = await runCompanyAnalysis(query);
    res.status(200).json(report);
  } catch (err: any) {
    console.error("[Vercel /api/analyze Error]:", err);
    res.status(500).json({
      error: err.message || "Failed to generate company analysis",
      hint: !process.env.GEMINI_API_KEY
        ? "GEMINI_API_KEY is not defined in Vercel. Please add GEMINI_API_KEY in Project Settings > Environment Variables, and redeploy."
        : undefined,
    });
  }
}
