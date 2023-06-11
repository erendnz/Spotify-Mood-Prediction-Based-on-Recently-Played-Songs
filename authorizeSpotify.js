const spotify = require('./credentials');

const authorizeSpotify = (req, res) => {
  const scopes = 'user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative user-top-read user-read-recently-played user-follow-read user-read-playback-state user-read-currently-playing user-modify-playback-state user-follow-modify user-library-modify playlist-modify-public playlist-modify-private';

  const url = `https://accounts.spotify.com/authorize?&client_id=${
    spotify.client_id
  }&redirect_uri=${encodeURI(
    spotify.redirect_uri
  )}&response_type=code&scope=${scopes}`;

  res.redirect(url);
};

module.exports = authorizeSpotify;
