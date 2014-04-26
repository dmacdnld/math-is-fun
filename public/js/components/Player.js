/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
  render: function () {
    var player = this.props.player;

    return (
      <li>{ player.name }, { player.points }</li>
    );
  }
});