/** @jsx React.DOM */
var PassengerWelcome = React.createClass({
  onTapEvent: function(){
    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.onTapEvent});
  },
  render: function() {

    return (<div><div className="widget-box timer"  onClick={this.props.onPassengerDone}>
      <img src="/assets/images/Icon-Close-Window.svg" className="close-modal" />
      <div className="progress-bar">
      <span>&nbsp;</span>
      </div>
    </div>
    <div className="widget-box identity">
      <div className="connectivity">
        <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
        <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="mobile-phone" />
      </div>
    </div>
    <div className="widget-box info">
      <h1>Welcome, Passenger!</h1>
      <dl className="sharing">
        <dt>Last time you shared:</dt>
        <dd>
          <img src="/assets/images/Icon-Music-Library.svg" />
        </dd>
        <dd>
          <img src="/assets/images/Icon-Address-Book.svg" />
        </dd>
        <dd>
          <img src="/assets/images/Icon-Location.svg" />
        </dd>
        <dd className="de-emphasized">
          <img src="/assets/images/Icon-Add.svg" />
        </dd>
      </dl>
    </div>
    <div className="widget-box finish-task" onClick={this.onTapEvent}>
      <button>Done</button>
    </div></div>);
  }
});





function PassengerWelcomeWidget(broker) {

  function render(data) {
    React.render(<PassengerWelcome onTapEvent={data.onTapEvent} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_welcome", render, "PASS");
}

widgets.push({fn: PassengerWelcomeWidget, channel: "PASS"});

/** new widget **/

var PassengerAuthentication = React.createClass({
  render: function() {

    return (<div><div className="widget-box identity">
              <div className="connectivity">
                <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
                <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="mobile-phone" />
                <div className="sharing">
                  <img src="/assets/images/Icon-Music-Library.svg" />
                  <img src="/assets/images/Icon-Address-Book.svg" />
                  <img src="/assets/images/Icon-Location.svg" />
                </div>
                <p className="temperature">68º</p>
              </div>
            </div>
            </div>);
  }
});




function PassengerAuthenticationWidget(broker) {

  function render(data) {
    React.render(<PassengerAuthentication />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_authentication", render, "PASS");
}

widgets.push({fn: PassengerAuthenticationWidget, channel: "PASS"});