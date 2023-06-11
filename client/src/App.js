import React, { Component } from 'react';
import Pusher from 'pusher-js';
import format from 'date-fns/format';
import './App.css';

class App extends Component {
  constructor() {
    super();
    const urlParams = new URLSearchParams(window.location.search);
    const isUserAuthorized = urlParams.has('authorized') ? true : false;

    this.state = {
      isUserAuthorized,
      musicHistory: [],
      moodPercentages: {
        energetic: 0,
        relaxing: 0,
        dark: 0,
        aggressive: 0,
        happy: 0,
      },
    };
  }

  componentDidMount() {
    const { isUserAuthorized } = this.state;

    if (isUserAuthorized) {
      fetch('http://localhost:5000/mood')
        .then((res) => res.json())
        .then((data) => {
          this.setState({
            musicHistory: data,
          });
          this.calculateMoodPercentages(data);
        })
        .catch((error) => console.log(error));

      const pusher = new Pusher('', {
        cluster: 'eu',
        encrypted: true,
      });

      const channel = pusher.subscribe('spotify');
      channel.bind('update-history', (data) => {
        this.setState(
          (prevState) => {
            const arr = data.musicHistory
              .map((item) => {
                const isPresent = prevState.musicHistory.find((e) => e.track_name === item.track_name);
                if (isPresent === undefined) {
                  return item;
                } else {
                  return null;
                }
              })
              .filter(Boolean);
            return {
              musicHistory: arr.concat(prevState.musicHistory),
            };
          },
          () => {
            this.calculateMoodPercentages(this.state.musicHistory);
          }
        );
      });
    }
  }

  calculateMoodPercentages = (musicHistory) => {
  const moodCounts = {
    energetic: 0,
    relaxing: 0,
    dark: 0,
    aggressive: 0,
    happy: 0,
  };

  musicHistory.forEach((item) => {
    const mood = item.mood;
    moodCounts[mood]++;
  });

  const totalTracks = musicHistory.length;
  const moodPercentages = {};

  for (const mood in moodCounts) {
    const percentage = ((moodCounts[mood] / totalTracks) * 100).toFixed(2);
    moodPercentages[mood] = parseFloat(percentage);
  }

  // Yüzde değerlerine göre sıralama
  const sortedMoodPercentages = Object.entries(moodPercentages).sort(
    (a, b) => b[1] - a[1]
  );

  this.setState({
    moodPercentages: Object.fromEntries(sortedMoodPercentages),
  });
};

  render() {
    const { isUserAuthorized, musicHistory, moodPercentages } = this.state;
    const connectSpotify = isUserAuthorized ? (
      ''
    ) : (
      <a href="http://localhost:5000/login">Connect your Spotify account</a>
    );

    const TableItem = (item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.track_name}</td>
        <td>{item.mood}</td>
      </tr>
    );

    const RecentlyPlayed = () => (
      <div className="recently-played">
        <h2>Recent Tracks</h2>
        <div className="mood-percentages">
          {Object.entries(moodPercentages).map(([mood, percentage]) => (
            <p key={mood}>
              %{percentage} {mood}
            </p>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Song title</th>
              <th>Mood</th>
            </tr>
          </thead>
          <tbody>{musicHistory.map((e, index) => TableItem(e, index))}</tbody>
        </table>
      </div>
    );

    return (
      <div className="App">
        <header className="header">
          <h1>Spotify Mood Prediction Based On Recently Played Tracks</h1>
          <p>View Your Mood</p>

          {connectSpotify}
          {musicHistory.length !== 0 ? <RecentlyPlayed /> : null}
        </header>
      </div>
    );
  }
}

export default App;
