const fetch = require('node-fetch');
const { Matrix } = require('ml-matrix');
const LogisticRegression = require('ml-logistic-regression');

// Modeli yükle
const modelData = require('./model.json');
const logisticRegression = LogisticRegression.load(modelData);

const getMood = (accessToken, trackId) => {
  const url = `https://api.spotify.com/v1/audio-features/${trackId}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const sampleInput = [
        data.valence,
        data.speechiness,
        data.instrumentalness,
        data.acousticness,
      ];

      const X = new Matrix([sampleInput]);
      const prediction = logisticRegression.predict(X);

      return prediction;
    })
    .catch((error) => console.log(error));
};

module.exports = getMood;
