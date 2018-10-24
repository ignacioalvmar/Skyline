/** @jsx React.DOM */
var DisplayImage = React.createClass({
  nextEvent: function(){
    if(this.props.clickEvent != null){
      window.broker.getSocket().emit("consoleEvent", {eventName: this.props.clickEvent});
    }
  },
  render: function() {

    if(this.props.audioFile != null){
      var el = $('body')[0];
      if (el.mp3) {
        if (el.mp3.paused) {
         el.mp3 = new Audio(this.props.audioFile);
         el.mp3.play();
        } else {
         el.mp3.pause();
         el.mp3 = new Audio(this.props.audioFile);
         el.mp3.play();
        }
      } else {
        el.mp3 = new Audio(this.props.audioFile);
        el.mp3.play();
      }

      el.mp3.loop = false;
      el.mp3.volume = 0.5;
    }

    return (<div onClick={this.nextEvent} ><img src={this.props.imageName} /></div>)
  }
});

function DisplayImageWidget(broker) {
  function render(data) {

    if(broker.getChannel() == 'CC'){
      if(data.quadrant == 5 || data.quadrant == 4 || data.quadrant == 'full'){
        document.getElementById(data.quadrant).style.pointerEvents = "all";
      }
    }else if(broker.getChannel() == 'PASS'){
      if(data.quadrant == 2 || data.quadrant == 3 || data.quadrant == 'full'){
        document.getElementById(data.quadrant).style.pointerEvents = "all";
      }      
    }
    React.render(<DisplayImage imageName={data.imageName} clickEvent={data.clickEvent} audioFile={data.audioFile} />, document.getElementById(data.quadrant));
  }

  broker.sub("displayImage", render, broker.getChannel());
}

widgets.push({fn: DisplayImageWidget, channel: "CC"});
widgets.push({fn: DisplayImageWidget, channel: "HUD"});
widgets.push({fn: DisplayImageWidget, channel: "IP"});
widgets.push({fn: DisplayImageWidget, channel: "phone"});
widgets.push({fn: DisplayImageWidget, channel: "PASS"});