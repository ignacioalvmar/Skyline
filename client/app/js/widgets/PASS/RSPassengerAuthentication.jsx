/** @jsx React.DOM */
var RSPassengerWelcome = React.createClass({
  getInitialState: function() {
    return { image: this.props.image, temperature: this.props.temperature, name: this.props.name };
  },

    onTapEvent: function(){
    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.onTapEvent});
  },

  _onUpdatePassenger: function(message){
    var music_icon = function(){
      if (message.preferences.music){
        return "icon";
      }else {
        return "de-emphasized";
      }
    };

    var address_icon = function(){
      if (message.preferences.addressBook){
        return "icon";
      }else {
        return "de-emphasized";
      }
    };

    var location_icon = function(){
      if (message.preferences.location){
        return "icon";
      }else {
        return "de-emphasized";
      }
    };
    var path = message.image.replace("C:\\Users\\Skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
    this.setState({ image: path, name: message.name, music: music_icon(), address: address_icon(), location: location_icon() });
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
        <img src={this.state.image} className="avatar" />
        <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="mobile-phone" />
      </div>
    </div>
    <div className="widget-box info">
      <h1>Welcome, {this.state.name}!</h1>
      <dl className="sharing">
        <dt>Last time you shared:</dt>
        <dd className={this.state.music}>
          <img src="/assets/images/Icon-Music-Library.svg" />
        </dd>
        <dd className={this.state.adddress}>
          <img src="/assets/images/Icon-Address-Book.svg" />
        </dd>
        <dd className={this.state.location}>
          <img src="/assets/images/Icon-Location.svg" />
        </dd>
      </dl>
    </div>
    <div className="widget-box finish-task" onClick={this.onTapEvent}>
      <button>Done</button>
    </div></div>);
  }
});


function RSPassengerWelcomeWidget(broker) {

  function render(data) {
    
    var socket = broker.getSocket();
    var rendering= React.render(<RSPassengerWelcome onTapEvent={data.onTapEvent} image={data.image} name={data.name} eventPassenger = {data.eventPassenger}  />, document.getElementById(data.quadrant));

    socket.emit('subscribe', { name: data.eventPassenger });
    socket.on(data.eventPassenger, function(message) {
      if (rendering.isMounted()) {
        rendering._onUpdatePassenger(message);
      }
    });
  }

  broker.sub("show_rs_passenger_welcome", render, "PASS");
}

widgets.push({fn: RSPassengerWelcomeWidget, channel: "PASS"});



/** new widget **/

var RSPassengerAuthentication = React.createClass({
  getInitialState: function() {
    return { image: this.props.image, temperature: this.props.temperature };
  },

  _onUpdatePassenger: function(message){
      var path = message.image.replace("C:\\Users\\Skyline\\skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
    this.setState({ temperature: message.preferences.temperature, image: path });
  },

  render: function() {
    return (<div><div className="widget-box identity">
              <div className="connectivity">
                <img src={this.state.image} className="avatar" />
                <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="mobile-phone" />
                <div className="sharing">
                  <img src="/assets/images/Icon-Music-Library.svg" />
                  <img src="/assets/images/Icon-Address-Book.svg" />
                  <img src="/assets/images/Icon-Location.svg" />
                </div>
                <p className="temperature">{this.state.temperature}º</p>
              </div>
            </div>
            </div>);
  }
});


function RSPassengerAuthenticationWidget(broker) {
  function render(data) {
    var socket = broker.getSocket();
    var rendering = React.render(< RSPassengerAuthentication name={data.name} image={data.image} temperature={data.temperature} eventPassenger={data.eventPassenger}  />, document.getElementById(data.quadrant));
    
    socket.emit('subscribe', { name: data.eventPassenger });
    socket.on(data.eventPassenger, function(message) {
      if (rendering.isMounted()) {
        rendering._onUpdatePassenger(message);
      }    
    });

  }
  broker.sub("show_rs_passenger_authentication", render, "PASS");
}

widgets.push({fn: RSPassengerAuthenticationWidget, channel: "PASS"});