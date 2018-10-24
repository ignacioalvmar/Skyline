/**
 * @jsx React.DOM
 */

 /*

  comment from myk: I basically just changed out the render logic from the existing ProgressBar component
  I found. I don't 100% understand how every part of this works, but it does seem to work. So, neat.

 */
var TimerBar = React.createClass({
  propTypes: {
    timeoutValue: React.PropTypes.number.isRequired,
    interval: React.PropTypes.number,
    onTick: React.PropTypes.func,
    onComplete: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      timeoutValue: 10000,
      interval: 200,
      onTick: undefined,
      onComplete: undefined,
    };
  },

  getInitialState: function() {
    // Normally an anti-pattern to use this.props in getInitialState,
    // but these are all initializations (not an anti-pattern).
    return {
      timeRemaining: this.props.timeoutValue,
      timeoutId: undefined,
      prevTime: undefined
    };
  },

  componentWillReceiveProps: function(newProps, oldProps) {
    if (this.state.timeoutId) clearTimeout(this.state.timeoutId);
    this.setState({ prevTime: undefined, timeRemaining: newProps.initialTimeRemaining });
  },

  componentDidMount: function() {
    this.tick();
  },

  componentDidUpdate: function(){
    if ((!this.state.prevTime) && this.state.timeRemaining > 0 && this.isMounted()) {
      this.tick();
    }
  },

  componentWillUnmount: function() {
    clearTimeout(this.state.timeoutId);
  },

  tick: function() {

    var currentTime = Date.now();
    var dt = currentTime - this.state.prevTime || 0;
    var interval = this.props.interval;

    // correct for small variations in actual timeout time
    var timeRemainingInInterval = (interval - (dt % interval));
    var timeout = timeRemainingInInterval;

    if (timeRemainingInInterval < (interval / 2.0)){
      timeout += interval;
    }

    var timeRemaining = Math.max(this.state.timeRemaining - dt, 0);
    var countdownComplete = (this.state.prevTime && timeRemaining <= 0);

    if (this.isMounted()){
      if (this.state.timeoutId) clearTimeout(this.state.timeoutId);
      this.setState({
        timeoutId: countdownComplete ? undefined: setTimeout(this.tick, timeout),
        prevTime: currentTime,
        timeRemaining: timeRemaining
      });
    }

    if (countdownComplete) {
      if (this.props.onComplete) { this.props.onComplete() };
      return;
    }

    if (this.props.onTick) {
      this.props.onTick(timeRemaining);
    }
  },

  render: function() {
    var spanStyle = {
      width: (100 * ((this.props.timeoutValue - this.state.timeRemaining) / this.props.timeoutValue)) + "%"
    };

    return (<div className="progress-bar"><span style={spanStyle}>&nbsp;</span></div>);
  }
});