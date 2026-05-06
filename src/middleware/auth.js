import dotenv from "dotenv";
dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token || token !== process.env.AUTH_TOKEN) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}
