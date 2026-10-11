export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "ok",
    runtime: "vercel-serverless",
    timestamp: new Date().toISOString(),
  });
}
