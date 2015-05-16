import React from 'react';

class JoinForm extends React.Component {
  constructor() {
    super();
    this.state = { rejected: false };
  }

  handlePlayerApplication(event) {
    event.preventDefault();
    const name = React.findDOMNode(this.refs.name).value.trim();
    this.props.emitPlayerApplication(name);
  }

  render() {
    const { rejected } = this.state;
    let jsxToRender;

    if (rejected) {
      jsxToRender = (
        <form id='join-form' onSubmit={ this.handlePlayerApplication.bind(this) }>
          <label htmlFor='name'>Choose a name</label>
          <small id='invalid-name-message'>That name is taken. Choose another.</small>
          <input id='name' type='text' placeholder='e.g. Mathlete' ref='name' autofocus/>
          <small>or join as a guest</small>
          <button className='btn btn--primary' type='submit'>Start playing!</button>
        </form>
      )
    } else {
      jsxToRender = (
        <form id='join-form' onSubmit={ this.handlePlayerApplication.bind(this) }>
          <label htmlFor='name'>Choose a name</label>
          <input id='name' type='text' placeholder='e.g. Mathlete' ref='name' autofocus/>
          <small>or join as a guest</small>
          <button className='btn btn--primary' type='submit'>Start playing!</button>
        </form>
      );
    }
    return jsxToRender;
  }
};

export default JoinForm;
