import prisma from "../common/client.js";
import { oauthClient } from "../routes/qbAuth.js";

export async function refreshQbToken(req, res, next) {
  try {
    console.log("🔄 Attempting to refresh QuickBooks access token...");

    // fetch stored token
    const tokenTable = await prisma.token.findUnique({
      where: { id: 1 },
    });

    if (!tokenTable || !tokenTable.refreshToken) {
      return res.status(401).json({ error: "QuickBooks refresh token not found." });
    }

    // refresh refresh token
    const authResponse = await oauthClient.refreshUsingToken(tokenTable.refreshToken);

    const newAccessToken = authResponse?.token?.access_token;
    const newRefreshToken = authResponse?.token?.refresh_token;

    if (!newAccessToken) {
      throw new Error("No access token returned from QuickBooks refresh.");
    }

    // update DB with new refresh token
    if (newRefreshToken) {
      await prisma.token.update({
        where: { id: 1 },
        data: { refreshToken: newRefreshToken },
      });
      console.log("✅ Updated QuickBooks refresh token in DB");
    }

    console.log("✅ Refreshed QuickBooks access token successfully");

    next(); // pass control to the next middleware or route
  } catch (err) {
    console.error("QuickBooks token refresh error:", err);

    // clear the stored token to force reconnection
    await prisma.token.update({ where: { id: 1 }, data: { refreshToken: null } });

    return res.status(500).json({ error: "Failed to refresh QuickBooks token." });
  }
}
