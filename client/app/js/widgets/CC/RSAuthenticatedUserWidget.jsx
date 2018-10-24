/** @jsx React.DOM */
var RSAuthenticateDriver = React.createClass({
  getInitialState: function() {
    return { temperatureDriver: this.props.temperatureDriver, imageDriver: this.props.imageDriver, temperaturePassenger: this.props.temperaturePassenger, imagePassenger: this.props.imagePassenger };
  },

  componentWillUnmount: function(){
      //broker.getSocket().emit('unsubscribe', { name: this.props.eventDriver });
      //console.log("Client is unsubscribing");
      //$("#" + "RSAuthenticateDriver").empty();
  },

  render: function() {
    return (<div>
      <div key="driver" className="widget-box half">
            <img src={this.state.imageDriver} className="avatar" />
            <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="icon-smartphone" />
            <h1><span className="highlight">{this.state.temperatureDriver}º</span></h1>
            <p><img src="/assets/images/Icon-Seat.svg" className="icon-seat" /></p>
      </div>
      <div key="passenger" className="widget-box half">
            <img src={this.state.imagePassenger} className="avatar" />
            <img src="/assets/images/Icon-Mobile-Phone-Check.svg" className="icon-smartphone" />
            <h1><span className="highlight">{this.state.temperaturePassenger}º</span></h1>
            <p><img src="/assets/images/Icon-Seat.svg" className="icon-seat" /></p>
      </div>

      </div>);
  }
});

function rsAuthenticatedWidget(broker) {
  function render(data) {
    var socket = broker.getSocket();
    var rendering = React.render(<RSAuthenticateDriver imageDriver={data.imageDriver} eventDriver={data.eventDriver} eventPassenger={data.eventPassenger} temperatureDriver={data.temperatureDriver} imagePassenger={data.imagePassenger} temperaturePassenger={data.temperaturePassenger} />, document.getElementById(data.quadrant));
    
    socket.emit('subscribe', { name: data.eventDriver }, "CC");
    socket.on(data.eventDriver, function(message) {
        if (rendering.isMounted()) {
            var path = message.image.replace("C:\\Users\\Skyline\\skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
          rendering.setState({ temperatureDriver: message.preferences.temperature, imageDriver: path });
        }      
    });

    socket.emit('subscribe', { name: data.eventPassenger }, "CC");
    socket.on(data.eventPassenger, function(message) {
        if (rendering.isMounted()) {
            var path = message.image.replace("C:\\Users\\Skyline\\skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
          rendering.setState({ temperaturePassenger: message.preferences.temperature, imagePassenger: path });
        }
    });


  }
  broker.sub("show_rs_authenticated_user", render, "CC");
}

widgets.push({fn: rsAuthenticatedWidget, channel: "CC"});