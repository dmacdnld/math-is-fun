/** @jsx React.DOM */

var React = require('react');
var Player = require('./Player');

module.exports = React.createClass({
  render: function () {
    return (
      <ul id='player-list'>
        {this.props.players.map(function (player) {
          return <Player player={ player } />;
        })}
      </ul>
    );
  }
});