/** @jsx React.DOM */
var PhoneNotification = React.createClass({
  nextWindow: function(){
    this.props.onPhoneTap(this.props.nextState);
  },
  render: function() {
    return (<div onClick={this.nextWindow} ><img src={"/assets/images/" + this.props.image} /></div>)
  }
});

function PhoneNotificationWidget(broker) {
  function phoneTap(nextState){
    if(nextState == "11"){
      broker.pub(StateEvents.TO_STATE_11, {purgeHUD: true});
    }else if(nextState == "12"){
      broker.pub(StateEvents.TO_STATE_12, {purgeHUD: true});
    }else if(nextState == "13"){
      broker.pub(StateEvents.TO_STATE_13, {purgeHUD: true});
    }else if(nextState == "clear"){
      broker.pub("reinitialize", {}, "phone");
    }   
    
  }
  function render(data) {
    React.render(<PhoneNotification image={data.imageUrl} nextState={data.nextState} onPhoneTap={phoneTap} />, document.getElementById(data.quadrant));
  }

  broker.sub("phone_notification", render, "phone");
}

widgets.push({fn: PhoneNotificationWidget, channel: "phone"});