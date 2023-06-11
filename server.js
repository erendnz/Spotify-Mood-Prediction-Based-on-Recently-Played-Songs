require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authorizeSpotify = require('./authorizeSpotify');
const getAccessToken = require('./getAccessToken');
const refreshAccessToken = require('./refreshAccessToken');
const getRecentlyPlayed = require('./getRecentlyPlayed');
const Datastore = require('nedb');
const cron = require('node-cron');
const Pusher = require('pusher');
const LogisticRegression = require('ml-logistic-regression');
const getMood = require('./getMood');

const clientUrl = process.env.CLIENT_URL;

const app = express();

const db = new Datastore();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', authorizeSpotify);
app.get('/callback', getAccessToken, (req, res, next) => {
  db.insert(req.credentials, err => {
    if (err) {
      next(err);
    } else {
      res.redirect(`${clientUrl}/?authorized=true`);
    }
  });
});

app.get('/history', (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      throw Error('Failed to retrieve documents');
    }

    const accessToken = docs[0].access_token;
    getRecentlyPlayed(accessToken)
      .then(data => {
        const arr = data.map(e => ({
          played_at: e.played_at,
          track_name: e.track.name,
        }));

        res.json(arr);
      })
      .then(() => {
        cron.schedule('*/5 * * * *', () => {
          getRecentlyPlayed(accessToken).then(data => {
            const arr = data.map(e => ({
              played_at: e.played_at,
              track_name: e.track.name,
            }));

            pusher.trigger('spotify', 'update-history', {
              musicHistory: arr,
            });
          });
        });
      })
      .catch(err => console.log(err));
  });
});

app.get('/mood', (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      throw Error('Failed to retrieve documents');
    }

    const accessToken = docs[0].access_token;
    getRecentlyPlayed(accessToken)
      .then((data) => {
        const trackIds = data.map((e) => e.track.id);
        const trackNames = data.map((e) => e.track.name);

        const moodPromises = trackIds.map((trackId) => getMood(accessToken, trackId));

        Promise.all(moodPromises)
          .then((predictions) => {
            const results = trackNames.map((trackName, index) => ({
              track_name: trackName,
              mood: predictions[index],
            }));

            // Mood değerlerini güncelleyerek gönder
            const moodLabels = ['energetic', 'relaxing', 'dark', 'aggressive', 'happy'];
            const updatedResults = results.map((result) => ({
              track_name: result.track_name,
              mood: moodLabels[result.mood],
            }));

            res.json(updatedResults);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });
});


app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
