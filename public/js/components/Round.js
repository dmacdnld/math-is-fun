/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
    render: function () {
      return (
        <div>
          <div id="equation">{this.props.equation}</div>
          <div id="result" />
          <form action="/" method="post">
            <input type="hidden" name="answerA" value={this.props.choices[0]} />
            <button id="buttonA" type="submit">{this.props.choices[0]}</button>
          </form>
          <form action="/" method="post">
            <input type="hidden" name="answerB" value={this.props.choices[1]} />
            <button id="buttonB" type="submit">{this.props.choices[1]}</button>
          </form>
          <form action="/" method="post">
            <input type="hidden" name="answerC" value={this.props.choices[2]} />
            <button id="buttonC" type="submit">{this.props.choices[2]}</button>
          </form>
          <form action="/" method="post">
            <input type="hidden" name="answerD" value={this.props.choices[3]} />
            <button id="buttonD" type="submit">{this.props.choices[3]}</button>
          </form>
        </div>
      );
    }
});