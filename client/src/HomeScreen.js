import React, { Component } from 'react';
import RecentlyPlayed from './RecentlyPlayed';

class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      musicHistory: [],
    };
  }

  componentDidMount() {
    fetch('http://localhost:5000/history')
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          musicHistory: data,
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const { musicHistory } = this.state;

    return (
      <div className="home-screen">
        <h1>Spotify Listening History</h1>
        <p>View your music history in realtime with Spotify and Pusher</p>
        {musicHistory.length !== 0 ? <RecentlyPlayed musicHistory={musicHistory} /> : null}
      </div>
    );
  }
}

export default HomeScreen;
