import React from 'react';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './game-sketch';

class Game extends React.Component {
  render() {
    return (
      <div style={{width: '100%', height: '100%'}}>
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <P5Wrapper sketch={sketch} color={'red'}></P5Wrapper>
        </div>
      </div>
    );
  }
}

export default Game;
