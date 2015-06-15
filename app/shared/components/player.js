import React from 'react';

class Player extends React.Component {
  render() {
    const { player } = this.props;

    return (
      <li className='player'>{ player.name } <span className='player__points'>{ player.points }</span></li>
    );
  }
};

export default Player;