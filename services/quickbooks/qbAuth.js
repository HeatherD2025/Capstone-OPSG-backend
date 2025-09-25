import express from 'express';
import prisma from '../../common/client.js';
import OAuthClient from 'intuit-oauth';
import 'dotenv/config';

// create oathClient
export const oauthClient = new OAuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  environment: process.env.ENVIRONMENT,
  redirectUri: process.env.REDIRECT_URL,
});

// auth connection
export const connect = async (req, res) => {
  try {
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.Payment],
      state: "Init",
    });
    res.redirect(authUri);
  } catch (e) {
    console.error(e);
  }
};

export const qbToken = async (req, res) => {
  const parseRedirect = req.url;
  try {
    const authResponse = await oauthClient.createToken(parseRedirect);

    // store refresh token
    const refreshToken = await prisma.token.update({
      where: { id: 1 },
      data: {
        refreshToken: authResponse.token.refresh_token,
      },
    });
    console.log("updated refresh token");

    res.redirect("/qbauth/account"); // will redirect here with token
  } catch (e) {
    console.error(e);
  }
};

// example query to get account from sandbox company
export const account = async (req, res) => {
  try {
    const response = await oauthClient.makeApiCall({
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/9341454546075566/query?query=select * from Account&minorversion=75`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.status(200).send(response.response.data);
  } catch (e) {
    console.error(e);
  }
};

// revoke access token
export const disconnect = async (req, res) => {
  try {
    const accessToken = await oauthClient.getToken();
    console.log(accessToken);
    const response = await oauthClient.revoke();
    // console.log(response);
    res.redirect("/");
  } catch (e) {
    console.error(e);
  }
};

// get customer balance
export const customerBalance = async (req, res) => {
  try {
    const { id } = req.params; // company URL should be as follows: /company/companyID
    const { response } = await oauthClient.makeApiCall({
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/9341454546075566/reports/CustomerBalance?customer=${id}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data.Rows.Row;
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
  }
};

