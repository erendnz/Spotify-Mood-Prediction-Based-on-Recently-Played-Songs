const fetch = require('node-fetch');

const getAudioFeatures = (accessToken, trackId) => {
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
    .catch((error) => console.log(error));
};

module.exports = getAudioFeatures;
