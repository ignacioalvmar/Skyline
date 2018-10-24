/** @jsx React.DOM */
var PassengerMap = React.createClass({
  render: function() {
    return (<div className="map-with-passenger">
          <img src="/assets/images/Map-First-View-With-Car.svg" className="map-first-view" />
          <img src="/assets/images/avatar-passenger.jpg" className="map-passenger-marker" />
        </div>);
  }
});

function PassengerMapWidget(broker) {
  function render(data) {
    React.render(<PassengerMap />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_map", render, "CC");
}

widgets.push({fn: PassengerMapWidget, channel: "CC"});