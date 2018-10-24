/** @jsx React.DOM */
var PhoneBattery = React.createClass({
  btnClicked: function(){
    this.props.onCloseButton();
  },
  render: function() {


    return (<div className="widget-box modal" onClick={this.btnClicked}>
          <img src="/assets/images/Icon-Close-Window.svg" className="close-modal" />
          <h1>Battery Level Low!</h1>
          <h2>Place phone on charge mat.</h2>
          <p><img src="/assets/images/icon-low-batt_new.svg" className="icon-battery" /></p>
          <p><img src="/assets/images/icon-charge-pad.svg" className="phone-charge-diagram" /></p>
          <h2>Charge at destination:</h2>
          <p className="phone-charge-stats">93%</p>
        </div>);
  }
});

function PhoneBatteryWidget(broker) {
  function closeButton() {
    broker.pub(StateEvents.TO_STATE_33, {}); // return to default driving state
  }    
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<PhoneBattery onCloseButton={closeButton} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_phone_battery", render, "CC");
}

widgets.push({fn: PhoneBatteryWidget, channel: "CC"});