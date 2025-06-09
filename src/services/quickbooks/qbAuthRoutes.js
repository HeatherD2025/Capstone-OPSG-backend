const router = require("express").Router();
const { prisma } = require("../../common/common");
const {
  oauthClient,
  connect,
  qbToken,
  account,
  disconnect,
  customerBalance,
} = require("./qbAuth");

// refresh access token upon connecting to account
async function middleware(req, res, next) {
  try {
    console.log("attempting to refresh access token...");

    const tokenTable = await prisma.token.findUnique({
      where: { id: 1 },
    });
    // console.log(token.refreshToken);
    const refreshToken = tokenTable.refreshToken;
    const accessToken = oauthClient.getToken();
    await oauthClient.refresh(accessToken, refreshToken);
    console.log("refreshed access token successfully");
    next();
  } catch (e) {
    console.error(e);
  }
}

router.get("/connect", connect);
router.get("/callback", qbToken);
router.get("/disconnect", disconnect);

router.get("/account", middleware, account);
router.get("/company/:id", middleware, customerBalance);

module.exports = router;
