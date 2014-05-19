/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('player:rejected', function () {
      that.setState({ rejected: true });
    });
  },

  getInitialState: function () {
    return { rejected: false };
  },

  submitForm: function (event) {
    event.preventDefault();

    var name = this.refs.name.getDOMNode().value.trim();

    return socket.emit('player:applied', name);
  },

  render: function () {
    var rejected = this.state.rejected;
    var jsxToRender;

    if (rejected) {
      jsxToRender = (
        <form id="join-form" onSubmit={ this.submitForm }>
          <label htmlFor='name'>Choose a name</label>
          <small id="invalidNameMessage">That name is taken. Choose another.</small>
          <input id='name' type='text' placeholder='e.g. Mathlete' ref='name' autofocus/>
          <small>or join as a guest</small>
          <button className='btn btn--primary' type='submit'>Start playing!</button>
        </form>
      )
    } else {
      jsxToRender = (
        <form id="join-form" onSubmit={ this.submitForm }>
          <label htmlFor='name'>Choose a name</label>
          <input id='name' type='text' placeholder='e.g. Mathlete' ref='name' autofocus/>
          <small>or join as a guest</small>
          <button className='btn btn--primary' type='submit'>Start playing!</button>
        </form>
      );
    }
    return jsxToRender;
  }
});