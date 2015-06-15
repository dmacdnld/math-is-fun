import React from 'react';

class Choice extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.choice !== this.props.choice ||
           nextProps.answer !== this.props.answer ||
           nextProps.roundEnded !== this.props.roundEnded;
  }

  componentDidMount() {
    if (this.props.needsAutofocus) {
      React.findDOMNode(this.refs.button).focus();
    }
  }

  handleAnswerSubmission(roundEnded, event) {
    event.preventDefault();

    if (roundEnded) return;

    const chosenAnswer = Number(event.currentTarget.firstChild.value);
    this.state.chosenAnswer = chosenAnswer;
    this.props.emitAnswerSubmission(chosenAnswer);
  }

  render() {
    const { choice, roundEnded, answer, chosenAnswer } = this.props;
    let className = '';

    if (roundEnded) {
      if (choice === answer) {
        className = 'btn--correct';
      } else if (choice === this.state.chosenAnswer) {
        className = 'btn--incorrect';
      } else {
        className = 'btn--muted';
      }
    }

    return (
      <form onSubmit={ this.handleAnswerSubmission.bind(this, roundEnded) }>
        <input type='hidden' value={ choice } />
        <button ref='button' type='submit' className={ `btn ${ className }` }>{ choice }</button>
      </form>
    );
  }
};

export default Choice;
