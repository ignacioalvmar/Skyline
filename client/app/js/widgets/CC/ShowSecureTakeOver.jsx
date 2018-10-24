/** @jsx React.DOM */
var TakeOverStepOne = React.createClass({

  getInitialState: function() {
    return { eyes: this.props.eyes, head: this.props.head, phone: this.props.phone, hands: this.props.hands, image: this.props.image, closeEventClick: this.props.closeEventClick, close: this.props.close };
  },

  // emit the proper event on button click
  closeEventClick: function()
  {
      if(this.props.closeEventClick != null)
      {
          window.broker.getSocket().emit("consoleEvent", {eventName: this.props.closeEventClick});
      }
  },

  _onUpdateRendering: function(message){
    var path = message.image.replace("C:\\Users\\Skyline\\il_uxr_skyline-baseline\\client\\generated\\",'');
    if(this.isMounted()){
      this.setState({ image: path });
    }
  },

  _updateEyes: function(message){

    var eyes_icon = function(){
      if (message.State){
        return "takeovericon";
      }else {
        return "takeovericon_disabled";
      }
    };
    if(this.isMounted()){
      this.setState({ eyes: eyes_icon() });
    }
  },

  _updateHead: function(message){

    var head_icon = function(){
        if (message.State){
          return "takeovericon";
        }else {
          return "takeovericon_disabled";
        }
    };
    if(this.isMounted()){      
      this.setState({ head: head_icon() });
    }
  },

  _updatePhone: function(message){

    var phone_icon = function(){
        if (message.State){
          return "takeovericon";
        }else {
          return "takeovericon_disabled";
        }
    };
     if(this.isMounted()){
      this.setState({ phone: phone_icon() });
    }
  },

  _updateHands: function(message){

    var hands_icon = function(){
      if (message.State){
        return "takeovericon";
      }else {
        return "takeovericon_disabled";
      }
    };
    if(this.isMounted()){
      this.setState({ hands: hands_icon() });
    }
  },

  componentDidUpdate: function() {
    console.log("ComponentDidUpdate Called");
    if (this.state.head == "takeovericon" && this.state.eyes == "takeovericon" && this.state.phone == "takeovericon" && this.state.hands == "takeovericon" ) {
      console.log("All driver monitoring conditions are met");
      window.broker.getSocket().emit("consoleEvent", {eventName: "autopilot_end"});
    }
  },
    
  render: function() {
    return (<div><img src= {this.state.close} className="modal-close" onClick= {this.closeEventClick} />
        <div className="modal-circle">
          <div className="dinner">
            <p>TAKE-OVER CONTROL PANEL</p>
            <br />
            <img src={this.state.image} className="avatar" />
            <table>
              <tr>
                <th>
                  <img src="/assets/images/Icon-eyes.svg" className={this.state.head} />   
                  <p>EYES ON THE ROAD</p>
                </th>
                <th>
                  <img src="/assets/images/Icon-sleepyDriver.svg" className={this.state.eyes} />
                  <p>AWAKE</p>
                </th>
              </tr>
              <tr>
                <th>
                  <img src="/assets/images/Icon-handSmartphone.svg" className={this.state.phone} />
                  <p>NO PHONE</p>
                </th>
                <th>
                  <img src="/assets/images/Icon-handsOnWheel.svg" className={this.state.hands} />
                  <p>HANDS ON WHEEL</p>
                </th>
              </tr>
            </table>            
          </div>
        </div></div>);
  }
});

function ShowTakeOverStepOneWidget(broker) {
  function render(data) {
    var socket = broker.getSocket();

    var rendering= React.render(<TakeOverStepOne image={data.image} eyes={data.eyes} head={data.head} phone={data.phone} hands={data.hands} close={data.close} closeEventClick={data.closeEventClick} />, document.getElementById(data.quadrant));

    socket.emit('subscribe', { name: data.imageEvent });
    socket.on(data.imageEvent, function(message) {
      rendering._onUpdateRendering(message);

    });

    socket.emit('subscribe', { name: data.eyesEvent });
    socket.on(data.eyesEvent, function(message) {
      rendering._updateEyes(message);
    });

    socket.emit('subscribe', { name: data.headEvent });
    socket.on(data.headEvent, function(message) {
      rendering._updateHead(message);
    });

    socket.emit('subscribe', { name: data.phoneEvent });
    socket.on(data.phoneEvent, function(message) {
      rendering._updatePhone(message);
    });
    
    socket.emit('subscribe', { name: data.handsEvent });
    socket.on(data.handsEvent, function(message) {
      rendering._updateHands(message);
    });

    //TODO Check values from messages are all clear. Then subscribe to next event.
    
  }
  
  broker.sub("show_takeover_step_one", render, broker.getChannel());
}

widgets.push({fn: ShowTakeOverStepOneWidget, channel: "PASS"});
widgets.push({fn: ShowTakeOverStepOneWidget, channel: "CC"});