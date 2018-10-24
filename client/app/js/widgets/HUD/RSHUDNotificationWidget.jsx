/** @jsx React.DOM */
var RSHUDNotification = React.createClass({
  getInitialState: function() {
    return { image: this.props.image, message_text: this.props.message_text, music: this.props.music ,address: this.props.address, location: this.props.location, calendar: this.props.calendar };
  },

  _onUpdateRendering: function(message){
      var path = message.image.replace("C:\\Users\\Skyline\\il_uxr_skyline-baseline\\client\\generated\\", '');
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

    var calendar_icon = function(){
      if (message.preferences.calendar){
        return "icon";
      }else {
        return "de-emphasized";
      }
    };

    this.setState({ image: path, music: music_icon(), message_text: message.name, address: address_icon(), location: location_icon() , calendar: calendar_icon() });
  },

  render: function() {

    return (<div className="widget-box">
      <p className="message">
        <bdi>Welcome {this.state.message_text}</bdi><br />
      </p>
      <div className="passenger-privacy">
      <p className="secondary_icon_class">
        <img src={this.state.image} className="avatar" />
        <img src={"assets/images/Icon-Privacy.svg"} className="icon" />
        <img src={"assets/images/Icon-Music-Library.svg"} className={this.state.music} />
        <img src={"assets/images/Icon-Address-Book.svg"} className={this.state.address} />
        <img src={"assets/images/Icon-Location.svg"} className={this.state.location} />
        <img src={"assets/images/Icon-Calendar.svg"} className={this.state.calendar} />
      </p>
      </div>
    </div>);
  }
});

function rsHUDNotificationWidget(broker) {
  function render(data) {
    var socket = broker.getSocket();
    var rendering = React.render(<RSHUDNotification image={data.image} music={data.music} address={data.address} location={data.location} calendar={data.calendar} message_text={data.message_text} event={data.event}  />, document.getElementById(data.quadrant));
    
    socket.emit('subscribe', { name: data.event });
    socket.on(data.event, function(message) {
      if (rendering.isMounted()) {
        rendering._onUpdateRendering(message);
      }
    });
  }
  broker.sub("show_rs_hud_notification", render, "HUD");
}

widgets.push({fn: rsHUDNotificationWidget, channel: "HUD"});