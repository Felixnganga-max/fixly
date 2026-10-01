// Move the secret to env (JWT_SECRET) and delete the fallback. The old literal
// was pasted into chat/source, so treat it as burned and rotate it.
const JWT_SECRET = process.env.JWT_SECRET || "fixly_super_secret_jwt_key_2024";
if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET not set — using insecure fallback. Set it in env.");
}
module.exports = { JWT_SECRET };