/** @jsx React.DOM */
var TermsAndConditions = React.createClass({
  okEvent: function(){
    console.log("calling accept event");
    console.log(this.props.termsAcceptedEvent);
    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.termsAcceptedEvent});
  },
  callOwnerEvent: function(){
    window.broker.getSocket().emit("consoleEvent", {eventName: this.props.callOwnerEvent});  
  },
  render: function() {

    if(this.props.welcomeText == '' || !this.props.welcomeText){
      this.props.welcomeText = "Jenna Kreuger's car.";
    }

    if(this.props.bodyText == '' || !this.props.bodyText){
      this.props.bodyText = "Because this is a shared car, its location is available to the owner.  " +
            "I've also prioritized the owner as the " +
            "main point of contact, in case of emergency, or if you wanna tell her thanks!";
    }

    return (<div className="widget-box">
              <div className="form-header">
                <h1>Terms & Conditions</h1>
              </div>
              <div className="form-body">
                <h1>Welcome to</h1>
                <h1 className="name"> {this.props.welcomeText} </h1>
                <p> {this.props.bodyText} </p>
                <h1>Do you agree to the terms and conditions?</h1>
                <div onClick={this.okEvent}> 
                  <h1>OK</h1> 
                </div>
                <div onClick={this.callOwnerEvent}> 
                  <h1>Call Owner</h1> 
                </div>
              </div>
          </div>)
  }
});

function TermsAndConditionsWidget(broker) {
  function render(data) {
    React.render(<TermsAndConditions welcomeText={data.welcomeText} bodyText={data.bodyText} termsAcceptedEvent={data.termsAcceptedEvent} callOwnerEvent={data.callOwnerEvent} />, document.getElementById(data.quadrant));
  }

  broker.sub("termsandconditions", render, "CC");
}

widgets.push({fn: TermsAndConditionsWidget, channel: "CC"});