/** @jsx React.DOM */
var PassengerDropoff = React.createClass({
  render: function() {


    return (<div className="widget-box single-message">
          <h1><img src="/assets/images/avatar-passenger.jpg" className="avatar" /><br />Goodbye, passenger!</h1>
        </div>);
  }
});

function PassengerDropoffWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<PassengerDropoff />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_dropoff", render, "PASS");
}

widgets.push({fn: PassengerDropoffWidget, channel: "PASS"});