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

// connect to Quickbooks
export const connect = async (req, res) => {
  try {
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.Payment],
      state: "Init",
    });
    res.redirect(authUri);
  } catch (error) {
    console.error("Quickbooks connection error", error);
    res.status(500).send("Failed to connect with Quickbooks");
  }
};

// Quickbooks OAuth callback
export const qbToken = async (req, res) => {
  const parseRedirect = req.url;
  try {
    const authResponse = await oauthClient.createToken(parseRedirect);
    const refreshToken = authResponse?.token?.refreshToken;
    const realmId = authResponse?.token?.realmId || req.query.realmId;

    if (!refreshToken) {
      throw new Error("No refresh token received from Quickbooks");
    }

    // store refresh token
    await prisma.token.upsert({
      where: { id: 1 },
      update: { refreshToken, realmId },
      create: { id: 1, refreshToken, realmId },
    });

    console.log("Quickbooks refreshed token and realmId stored");
    res.status(200).json({ success: true, redirectUrl: "/qbauth/account"}); // will redirect here with token
  } catch (error) {
    console.error("Quickbooks token exchange error", error);
    res.status(500).send("Failed to exchange Quickbooks token");
  }
};

// query to get account from sandbox company
export const account = async (req, res) => {
  try {
    const data = await makeQbApiCall(
      "query?query=select * from Account&minorversion=75"
    );
    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching Quickbooks account", error);
    res.status(500).send("Failed to fetch account info");
  }
};

// revoke access token
export const disconnect = async (req, res) => {
  try {
    const token = oauthClient.getToken();
    if (!token) throw new Error("No active Quickbooks token found");

    await oauthClient.revoke();
    console.log("Quickbooks access sucessfully revoked");

    // clear token from db
    await prisma.token.update({
      where: { id: 1 },
      data: { refreshToken: "", realmId: null },
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error disconnecting from Quickbooks", error);
    res.status(500).send("Failed to disconnect from Quikcbooks");
  }
};

// get customer balance
export const customerBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await makeQbApiCall(`reports/CustomerBalance?customer=${id}`);
    res.status(200).send(data?.Rows?.Row || []);
  } catch (error) {
    console.error("Error fetching customer balance", error);
    res.status(500).send("Failed to fetch customer balance");
  }
};
