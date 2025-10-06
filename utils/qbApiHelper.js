import prisma from "../common/client.js";
import { oauthClient } from "../services/quickbooks/qbAuth.js";
import "dotenv/config";

const COMPANY_ID = process.env.QB_COMPANY_ID;
const API_BASE =
  process.env.QB_API_BASE ||
  "https://sandbox-quickbooks.api.intuit.com/v3/company";

// before making API call, check if QB has a valid access token
async function ensureValidToken() {
  const tokenRow = await prisma.token.findUnique({ where: { id: 1 } });

  if (!tokenRow || !tokenRow.refreshToken) {
    throw new Error("No Quickbooks token found");
  }

  try {
    const currentToken = oauthClient.getToken();

    if (!currentToken || !currentToken.access_token) {
      console.log("Refreshing Quickbooks before call to API...");
      await oauthClient.refreshUsingToken(tokenRow.refreshToken);
    }
  } catch (error) {
    console.error("Error refreshing Quickbooks token", error);
    throw new Error("Failed to refresh Quickbooks access token");
  }
}

/**
 * Makes an API call to QuickBooks, automatically including company ID + base URL.
 * @param {string} endpoint - The path after the company ID, e.g. "query?query=select * from Account&minorversion=75"
 * @param {object} [options] - Extra fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export const makeQbApiCall = async (endpoint, options = {}) => {
  try {
    await ensureValidToken();

    const response = await oauthClient.makeApiCall({
      url: `${API_BASE}/${COMPANY_ID}/${endpoint}`,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body || undefined,
    });

    return response.response.data;
  } catch (error) {
    console.error("QuickBooks API call failed", error);
    throw error;
  }
};
