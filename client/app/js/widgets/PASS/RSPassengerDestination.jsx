/** @jsx React.DOM */
var RSPassengerDestination = React.createClass({

  getInitialState: function() {
    return { image: this.props.image };
  },

  _onUpdatePassenger: function(message){
      var path = message.image.replace("C:\\Users\\Skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
    this.setState({ temperature: message.preferences.temperature, image: path, name: message.name });
  },

  componentWillUnmount: function(){
      //broker.getSocket().emit('unsubscribe', { name: this.props.eventPassenger });
      //console.log("Client is unsubscribing");
      //$("#" + "RSPassengerDestination").empty();
  },

  btnClicked: function(){
    var el = this.getDOMNode();
    var el2 = this.refs.circle1.getDOMNode();

    $(el2).css('background-color', '#fff');

    setTimeout(function() {
      $(el2).css('background-color', '');
    }, 200);

    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.onDestinationSelect});
  },

  btn2Clicked: function(){
    var el = this.getDOMNode();
    var el2 = this.refs.circle2.getDOMNode();

    $(el2).css('background-color', '#fff');

    setTimeout(function() {
      $(el2).css('background-color', '');
    }, 200);

    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.onDestinationSelect});
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
                <p className="temperature">68º</p>
              </div>
            </div>
            <div className="widget-box info">
              <h1>Please confirm your destination:</h1>
              <div className="destination-options">
                <dl>
                  <dt ref="circle1" onClick={this.btnClicked} >1</dt>
                  <dd>Club Meeting <em>124 SW Irving</em></dd>
                </dl>
                <dl>
                  <dt ref="circle2" onClick={this.btn2Clicked}>2</dt>
                  <dd>Work <em>1512 Elm St</em></dd>
                </dl>
                <dl>
                  <dt>+</dt>
                  <dd>Other</dd>
                </dl>
              </div>
            </div>
            </div>);
  }
});

function RSPassengerDestinationWidget(broker) {

  function render(data) {
    //console.log("Rendering passenger destination widgets now:", data);
    var socket = broker.getSocket(); 
    var rendering = React.render(< RSPassengerDestination onDestinationSelect={data.eventOnTap} image={data.image} eventPassenger={data.eventPassenger}  />, document.getElementById(data.quadrant));

    socket.emit('subscribe', { name: data.eventPassenger });
    socket.on(data.eventPassenger, function(message) {
      if (rendering.isMounted()) {
        rendering._onUpdatePassenger(message);
      }
    });
  }

  broker.sub("show_rs_passenger_destination", render, "PASS");
}

widgets.push({fn: RSPassengerDestinationWidget, channel: "PASS"});