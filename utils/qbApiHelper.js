import { oauthClient } from "../services/quickbooks/qbAuth.js"; 
import 'dotenv/config';

const COMPANY_ID = process.env.QB_COMPANY_ID;
const API_BASE = process.env.QB_API_BASE || "https://sandbox-quickbooks.api.intuit.com/v3/company";

/**
 * Makes an API call to QuickBooks, automatically including company ID + base URL.
 * @param {string} endpoint - The path after the company ID, e.g. "query?query=select * from Account&minorversion=75"
 * @param {object} [options] - Extra fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export const makeQbApiCall = async (endpoint, options = {}) => {
  try {
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
  } catch (err) {
    console.error("QuickBooks API error:", err);
    throw err;
  }
};
