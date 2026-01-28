import prisma from "../common/client.js";
import OAuthClient from "intuit-oauth";
import "dotenv/config";
import { makeQbApiCall } from "../utils/qbApiHelper.js";

// create OAuth client
export const oauthClient = new OAuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  environment: process.env.QB_ENVIRONMENT,
  redirectUri: process.env.REDIRECT_URL,
});

// connect to QuickBooks using OAuth client
export const connect = async (req, res) => {
  try {
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.Payment],
      state: "Init",
    });
    res.redirect(authUri);
  } catch (error) {
    console.error("QuickBooks connection error", error);
    res.status(500).send("Failed to connect with QuickBooks");
  }
};

// OAuth callback
export const qbToken = async (req, res) => {
  const parseRedirect = req.url;
  try {
    const authResponse = await oauthClient.createToken(parseRedirect);
    const refreshToken = authResponse?.token?.refreshToken;
    const realmId = authResponse?.token?.realmId || req.query.realmId;

    if (!refreshToken) throw new Error("No refresh token received from QuickBooks");

    // store refresh token in DB
    await prisma.token.upsert({
      where: { id: 1 },
      update: { refreshToken, realmId },
      create: { id: 1, refreshToken, realmId },
    });

    console.log("QuickBooks refreshed token and realmId stored");
    res.status(200).json({ success: true, redirectUrl: "/qbauth/account" });
  } catch (error) {
    console.error("QuickBooks token exchange error", error);
    res.status(500).send("Failed to exchange QuickBooks token");
  }
};

// Get company account info
export const account = async (req, res) => {
  try {
    // Optional: override userId if admin calls /account/:userId
    const userId = req.params.userId || req.user.id;

    // In sandbox, all users share same realmId, but in real apps you could fetch by userId
    const data = await makeQbApiCall("query?query=select * from Account&minorversion=75", {
      headers: { "Authorization": `Bearer ${req.qbAccessToken}` },
    });

    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching QuickBooks account", error);
    res.status(500).send("Failed to fetch account info");
  }
};

// Revoke access
export const disconnect = async (req, res) => {
  try {
    const token = oauthClient.getToken();
    if (!token) throw new Error("No active QuickBooks token found");

    await oauthClient.revoke();
    console.log("QuickBooks access successfully revoked");

    await prisma.token.update({
      where: { id: 1 },
      data: { refreshToken: "", realmId: null },
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error disconnecting from QuickBooks", error);
    res.status(500).send("Failed to disconnect from QuickBooks");
  }
};

// Get customer balance
export const customerBalance = async (req, res) => {
  try {
    // Support /customer/:id or /customer/:userId/:id
    // const userId = req.params.userId || req.user.id;
    // const customerId = req.params.id;
    const { id } = req.params;

    // for no Id return placeholder data
    if (!id || id === "undefined") {
      return res.status(200).json([
        { ColData: [{ value: "Demo Customer" }, { value: "0.00" }] },
    ]);
    }

    const data = await makeQbApiCall(
      `reports/CustomerBalance?customer=${id}`,
      { headers: { Authorization: `Bearer ${req.qbAccessToken}` } }
    );

    res.status(200).send(data?.Rows?.Row || []);
  } catch (error) {
    console.error("Error fetching customer balance", error);
    res.status(500).send("Failed to fetch customer balance");
  }
};
