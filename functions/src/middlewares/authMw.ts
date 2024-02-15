const authMw = async (req, res, next) => {
  console.log("Check if request is authorized with usrID token");

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    console.error(
      "No UserID token was passed as a Bearer token in the Authorization header."
    );
    res.status(403).send({
      status: "fail",
      message: "You are unauthorized",
    });
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log("Found 'Authorization' header");
    idToken = req.headers.authorization;
  } else {
    res.status(403).send({
      status: "fail",
      message: "You are unauthorized",
    });
  }

  const isVerified = verifyUserIDToken(idToken);
  if (isVerified) {
    res.locals.userID = idToken.split("Bearer ")[1];
    next();
    return;
  } else {
    console.error("Error while verifying UserID token");
    res.status(403).send({
      status: "fail",
      message: "You are unauthorized",
    });
  }
};

function verifyUserIDToken(idToken) {
  let finalToken = idToken;
  const isStartsWithBearer = idToken.startsWith("Bearer ");
  if (isStartsWithBearer) {
    finalToken = idToken.split("Bearer ")[1];
  } else {
    return false;
  }
  const isStartsWithUser = finalToken.startsWith("USER");
  const findNumbers = finalToken.match(/\d+/g);
  const isNumbersAre3Digits = findNumbers && findNumbers[0].length === 3;

  if (isStartsWithUser && isNumbersAre3Digits) {
    return true;
  } else {
    return false;
  }
}

module.exports = authMw;
