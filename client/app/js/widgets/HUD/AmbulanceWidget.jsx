/** @jsx React.DOM */
var AmbulanceNotification = React.createClass({
  render: function() {
    return (<div className="widget-box">
        <p className="ambulance-timer">
          <img src="/assets/images/Icon-Ambulance-Top.svg" className="icon" />
          <em><CountdownTimer initialTimeRemaining={200000} prefixText="Ambulance approaching in"/></em>
        </p>
      </div>);
  }
});

var SafePulloverNotification = React.createClass({
  getInitialState: function() {
    return {
      proximity: "Far",
      distance: 300
    };
  },
  render: function() {
    return (<div className="widget-box">
        <p className="distance">Safe shoulder in <strong>{this.state.distance} ft</strong></p>
        <img src={"/assets/images/Ambulence-Roadway-3.png"} className="ambulence" />
      </div>);
  }
});

function AmbulanceWidget(broker) {
  var updatingView;
  function render(data) {
    //React.render(<AmbulanceNotification />, document.getElementById("2"));
    updatingView = React.render(<SafePulloverNotification />, document.getElementById("3"));

    broker.sub("pullover_proximity", function(data) {
      updatingView.setState({proximity: data.proximity, distance: data.distance});
    });
  }

  broker.sub("hud_ambulance", render, "HUD");
}

widgets.push({fn: AmbulanceWidget, channel: "HUD"});