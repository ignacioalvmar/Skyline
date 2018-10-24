/** @jsx React.DOM */
var AuthenticatedUser = React.createClass({
  getInitialState: function() {
    return {showAnimation: true};
  },
  render: function() {
    var state = this.state;
    console.log("t");
    if(!this.props.users.map){
      this.props.users = JSON.parse(this.props.users);
    }

    return (<div>
      {this.props.users.map(function(user) {
        // we can remove this variable entirely
        var sharing_icons = (user.role === "passenger") ? (<p className="passenger-connected"></p>) : "";

        var seat;
        if (user.role === "passenger" && state.showAnimation) {
          // seat = (<p><video src="/assets/images/Icon-Seat-Animated.mp4" autoPlay loop className="icon-seat-moving"></video></p>);
          if(user.seat){
            seat = (<p><img src="/assets/images/Icon-Seat-Animated.gif" className="icon-seat-moving" /></p>);
          }
        } else {
          if(user.seat){
            seat = (<p><img src={"/assets/images/Icon-Seat.svg"} className="icon-seat" /></p>);
          }
        }

        var countdown = user.temperature_countdown || 0;
        var countdownCallback = function() {
          console.log("Countdown complete!");
        }

        return (
          <div key={user.role} className="widget-box half">
            <img src={"/assets/images/avatar-" + user.role + ".jpg"} className="avatar" />
            <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="icon-smartphone" />
            {sharing_icons}
            <h1><span className="highlight">{user.temp}º</span> <em><CountdownTimer initialTimeRemaining={countdown} completeCallback={countdownCallback} prefixText="in&nbsp;" /></em></h1>
            {seat}
          </div>
        );
      })}
    </div>);
  }
});

function UserAuthenticationWidget(broker) {
  var rendering;

  function render(data) {
    rendering = React.render(<AuthenticatedUser users={data.users} />, document.getElementById(data.quadrant));
    rendering.setState({showAnimation: true});

    setTimeout(function() {
      broker.pub("stop_animating_seat", {}, "CC");
    }, data.animation_duration);
  }

  function updateAnimation() {
    if (rendering.isMounted()) {
      rendering.setState({showAnimation:false});
    }
  }

  broker.sub("show_authenticated_user", render, "CC");
  broker.sub("stop_animating_seat", updateAnimation, "CC");
}

widgets.push({channel: "CC", fn:UserAuthenticationWidget});

/** new widget */

var ShowLoadingCircle = React.createClass({
  render: function() {

    return (<div className="loading">
          <div className="circle-1"></div>
          <div className="circle-2"></div>
          <div className="circle-3"></div>
        </div>);
  }
});

function ccShowLoadingCircle(broker) {

  function render(data) {
    React.render(<ShowLoadingCircle  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_loading_circle", render, broker.getChannel());
}

widgets.push({fn: ccShowLoadingCircle, channel: "CC"});
widgets.push({fn: ccShowLoadingCircle, channel: "PASS"});

/** new widget */

var ShowInitialMap = React.createClass({
  render: function() {

    return (<div>
            <img src="/assets/images/Map-First-View-With-Car.svg" className="map-first-view" />
        </div>);
  }
});

function ccShowInitialMap(broker) {

  function render(data) {
    React.render(<ShowInitialMap  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_initial_map", render, "CC");
}

widgets.push({fn: ccShowInitialMap, channel: "CC"});