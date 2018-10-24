/** @jsx React.DOM */

var Dossier = React.createClass({
  render: function() {
    var orgD = new Date;
    var d = new Date(orgD.getTime() + 10*60000);
    var hour = d.getHours();
    var ampm = "a.m.";
    if(hour > 12){
      hour = hour - 12;
      ampm = "p.m.";
    }
    var minute = d.getMinutes();
    
    var countdown = this.props.startingTime;
    var advanceFunction = this.props.advanceStateFunction;
    var countdownTick = function(time) {
      if (time <= 60000) {
        advanceFunction();
      }
    };

    return (<div className="widget-box">
              <div className="destination-options">
                <button className="button-flexible"><img src="/assets/images/Icon-Walking-Directions.svg" /></button>
                <button className="button-flexible"><img src="/assets/images/Icon-Pay-Parking.svg" /></button>
                <p>Begin walking by {hour}:{minute} {ampm}</p>
              </div>
              <div className="destination-location">
                <h2>Location</h2>
                <dl>
                  <dd><img src="/assets/images/avatar-restaurant.jpg" className="avatar" /></dd>
                </dl>
                <dl>
                  <dt>Imperial</dt>
                  <dd>Don’t miss the Parker House rolls…</dd>
                  <dd><button>Menu</button> <img src="/assets/images/Icon-Rating-Stars.svg" className="icon-rating" /></dd>
                </dl>
              </div>
              <div className="destination-messages">
                <h2>Related Messages</h2>
                <div className="destination-message">
                  <p className="sender"><img src="/assets/images/avatar-meeting-2.jpg" className="avatar" /></p>
                  <dl>
                    <dt>Meeting Agenda</dt>
                    <dd>We propose starting with financial discussion, moving into location and finally looking at required resources…</dd>
                  </dl>
                </div>
                <div className="destination-message">
                  <p className="sender"><img src="/assets/images/avatar-meeting-1.jpg" className="avatar" /></p>
                  <dl>
                    <dt>Proposal Status</dt>
                    <dd>Still working on the full list of items of that was requested by the tenant. Should have numbers finalized by…</dd>
                  </dl>
                </div>
                <div className="destination-message">
                  <p className="sender"><img src="/assets/images/avatar-meeting-1.jpg" className="avatar" /></p>
                  <dl>
                    <dt>Meeting Location Changed</dt>
                    <dd>We are moving the meeting to the clients location.  Does this work for you?</dd>
                  </dl>
                </div>
              </div>
            </div>);
  }
});

var PushToPhonePrompt = React.createClass({
  render: function() {
    countdown = this.props.startingTime;

    return (<div className="widget-box modal with-timer">
              <div className="destination-timer urgent">
                <p><img src="/assets/images/Icon-Timer.svg" /></p>
                <p>You must leave <CountdownTimer initialTimeRemaining={countdown} completeCallback={this.props.clickHandler} prefixText="in" /></p>
              </div>
              <p className="push-to-smartphone">
                <button className="button-flexible" onClick={this.props.clickHandler}>
                  <img src="/assets/images/Icon-Mobile-Phone.svg" />
                  <em>Push to Smartphone</em>
                </button>
              </p>
              <p className="cancel"><button className="button-flexible">Cancel</button></p>
            </div>);
  }
})

function DossierWidget(broker) {

  function advanceState() {
    broker.pub(StateEvents.TO_STATE_81, {});
  }

  function render(data) {
    React.render(<Dossier startingTime={data.timeoutValue} advanceStateFunction={advanceState} />, document.getElementById(data.quadrant));
  }

  function renderPhonePrompt(data) {

    function handler() {
      broker.pub(StateEvents.TO_STATE_90, {});
    }

    React.render(<PushToPhonePrompt startingTime={data.timeoutValue} clickHandler={handler}/>, document.getElementById(data.quadrant));
  }

  broker.sub("show_dossier", render, "CC");
  broker.sub("show_phone_prompt", renderPhonePrompt, "CC");
};

widgets.push({fn:DossierWidget, channel: "CC"});