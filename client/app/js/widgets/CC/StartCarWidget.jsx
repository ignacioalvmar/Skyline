/** @jsx React.DOM */
var StartCar = React.createClass({
    onStartCar: function(){
    
      if(this.props.clickEvent != null){
        window.broker.getSocket().emit("consoleEvent", {eventName: "ignition_start"});
        window.broker.getSocket().emit("consoleEvent", {eventName: this.props.clickEvent});
      }
      // window.broker.getSocket().emit("consoleEvent", {eventName: "Ignition"});
      var el2 = this.refs.startButton.getDOMNode();

      $(el2).css('background-color', '#fff');

      setTimeout(function() {
        $(el2).css('background-color', '');
      }, 100);

      var el = this.getDOMNode();
      setTimeout(function() {
          $(el).animate({width:'toggle'}, 500);
      }, 200);
  
  },
  render: function() {
    return (<div><div className="power-button-box">
          		<div ref="startButton" className="power-button" onClick={this.onStartCar} >
        		<img src="/assets/images/Icon-Power-Button.svg" className="icon-power-button" />
          		</div>
        	</div></div>);
  }
});

function StarCarWidget(broker) {
  function render(data) {
    React.render(<StartCar clickEvent={data.startEvent}/>, document.getElementById(data.quadrant));
  }

  broker.sub("show_start_car", render, "CC");
}

widgets.push({fn: StarCarWidget, channel: "CC"});        