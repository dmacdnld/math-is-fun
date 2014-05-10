/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
  render: function () {
    var player = this.props.player;

    return (
      <li className='player'>{ player.name } <span className='player__points'>{ player.points }</span></li>
    );
  }
});