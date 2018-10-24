/** @jsx React.DOM */
var PassengerDestination = React.createClass({
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

function PassengerDestinationWidget(broker) {

  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<PassengerDestination onDestinationSelect={data.eventOnTap} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_destination", render, "PASS");
}

widgets.push({fn: PassengerDestinationWidget, channel: "PASS"});