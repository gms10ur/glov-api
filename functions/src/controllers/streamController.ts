import * as admin from "firebase-admin";
const axios = require("axios");

exports.getHello = async (req, res) => {
  const userID = res.locals.userID;

  const header = {
    accept: "application/json",
  };
  const response = await axios.get("https://icanhazdadjoke.com/", {
    headers: header,
  });
  const joke = response.data.joke;

  res.status(200).send({
    status: "success",
    message: "Hello " + userID,
    joke: joke,
  });
};

exports.getStream = async (req, res) => {
  const userID = res.locals.userID;
  const isStream = req.query.stream === "true";

  console.log("isStream: ", isStream);
  if (isStream === undefined) {
    res.status(400).send({
      status: "fail",
      message: "stream parameter is missing",
    });
    return;
  }

  const findNumbers = userID.match(/\d+/g);
  const group = mapUserIdToGroup(findNumbers);
  const currentFirestoreTime = admin.firestore.Timestamp.now();

  const userRef = admin.firestore().collection("users").doc(userID.toString());
  const userDoc = await userRef.get();
  let userData = null;
  if (!userDoc.exists) {
    // Create user
    const user = {
      userID: userID,
      group: group,
      rateLimitLeft: 4,
      visitCount: 0,
      lastVisit: currentFirestoreTime,
    };
    await userRef.set(user);
  }
  userData = userDoc.data();
  const rateLimitLeft = userData?.rateLimitLeft ? userData.rateLimitLeft : 4;
  const lastVisit = userData?.lastVisit
    ? userData.lastVisit
    : currentFirestoreTime;

  const lastVisitTimestamp = lastVisit.toDate().getTime();
  const currentTimestamp = currentFirestoreTime.toDate().getTime();
  const timeDifference = currentTimestamp - lastVisitTimestamp;
  const newVisitCount = isStream
    ? 1
    : userData?.visitCount
    ? userData.visitCount + 1
    : 1;

  let newRateLimitLeft = rateLimitLeft - 1;
  if (timeDifference < 60000) {
    if (newRateLimitLeft < 1) {
      res.status(429).send({
        status: "fail",
        message: "Rate limit exceeded",
      });
      return;
    }
  } else {
    newRateLimitLeft = 4;
  }

  const resMessage =
    "Welcome USER_" +
    findNumbers +
    "! You are in group " +
    group +
    " and you have visited " +
    newVisitCount +
    " times.";

  const jokeHeader = {
    accept: "application/json",
  };
  const jokeResponse = await axios.get("https://icanhazdadjoke.com/", {
    headers: jokeHeader,
  });
  const joke = jokeResponse.data.joke;

  if (isStream) {
    // if stream is true, send the payload 5 times with 1 second interval
    for (let i = 0; i < 5; i++) {
      const streamData = {
        status: "success",
        message: resMessage,
        joke: joke,
        group: group,
        rate_limit_left: newRateLimitLeft,
        steam_seq: i + 1,
      };

      setTimeout(() => {
        //   res.status(200).send(streamData);
        res.status(200).write(JSON.stringify(streamData));
      }, 1000 * i);
    }
    res.status(200).end();
    await userRef.update({
      rateLimitLeft: newRateLimitLeft,
      lastVisit: currentFirestoreTime,
      visitCount: newVisitCount,
    });
    return;
  } else {
    res.status(200).send({
      status: "success",
      message: resMessage,
      joke: joke,
      group: group,
      rate_limit_left: newRateLimitLeft,
      steam_seq: 0,
    });

    await userRef.update({
      rateLimitLeft: newRateLimitLeft,
      lastVisit: currentFirestoreTime,
      visitCount: newVisitCount,
    });

    return;
  }
};

function mapUserIdToGroup(userId: number): number {
  const group = (userId % 10) + 1;
  return group;
}
