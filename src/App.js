import React from 'react';
import './App.css';
import Game from './components/game';
import DrawMap from './components/draw-map';

class App extends React.Component {
  state = {
    mode: 'game'
  }

  onGameClick = () => {
    this.setState({mode: 'game'});
  }

  onDrawMapClick = () => {
    this.setState({mode: 'draw'});
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%'}}>
        <div style={{display: 'flex'}}>
          <div onClick={this.onGameClick} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50%', height: '40px', color: 'white'}}>
            Game
          </div>
          <div onClick={this.onDrawMapClick} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50%', height: '40px', color: 'white'}}>
            Draw Map
          </div>
        </div>
        {this.state.mode === 'game' ? <Game /> : <DrawMap />}
      </div>
    );
  }
}

export default App;
