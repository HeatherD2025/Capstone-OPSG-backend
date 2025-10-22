import prisma from "../common/client.js";
import { oauthClient } from "../services/qbAuth.js";

export async function refreshQbToken(req, res, next) {
  try {
    console.log("Checking if QuickBooks token is valid...");

    const tokenTable = await prisma.token.findUnique({
      where: { id: 1 },
    });

    if (!tokenTable || !tokenTable.refreshToken) {
      console.warn("No QuickBooks tokens found in database.");
      return res
        .status(401)
        .json({ error: "QuickBooks not connected. Please reconnect." });
    }

    // Get expiration info
    const now = new Date();
    const expiresAt = tokenTable.expiresAt
      ? new Date(tokenTable.expiresAt)
      : null;
    const isExpired = !expiresAt || expiresAt <= now;

    let newAccessToken = tokenTable.accessToken;
    let newRefreshToken = tokenTable.refreshToken;
    let realmId = tokenTable.realmId;

    if (isExpired) {
      console.log("Refreshing expired QuickBooks access token...");

      // handles exchanging refresh token for new tokens
      const authResponse = await oauthClient.refreshUsingToken(
        tokenTable.refreshToken
      );
      const tokenData = authResponse?.token;

      newAccessToken = tokenData?.access_token;
      newRefreshToken = tokenData?.refreshToken || tokenTable.refreshToken;
      realmId = tokenData?.realmId || tokenTable.realmId;

      if (!newAccessToken) {
        throw new Error("QuickBooks did not return a new access token.");
      }

      // new expiry timestamp 55 mins
      const expiresAtNew = new Date(Date.now() + 55 * 60 * 1000); // 55 min buffer

      // save updated tokens to DB
      await prisma.token.update({
        where: { id: 1 },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          realmId,
          expiresAt: expiresAtNew,
        },
      });

      console.log("QuickBooks tokens refreshed and stored.");
    } else {
      console.log("QuickBooks access token still valid, using existing one.");
    }

    // Attach token data to request for use in subsequent handlers
    req.qbAccessToken = newAccessToken;
    req.qbRealmId = realmId;

    next();
  } catch (error) {
    console.error("QuickBooks token refresh error:", error);

    // Optional: clear bad tokens so the user must reconnect
    await prisma.token.update({
      where: { id: 1 },
      data: {
        accessToken: null,
        refreshToken: null,
        realmId: null,
        expiresAt: null,
      },
    });

    return res
      .status(500)
      .json({ error: "Failed to refresh QuickBooks token. Please reconnect." });
  }
}
