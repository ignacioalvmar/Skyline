/** @jsx React.DOM */
var HudListening = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <img src="/assets/images/Icon-Listening.gif" className="icon-listening-secondary" />
        </div>);
  }
});

function HudListeningWidget(broker) {
  function render(data) {
    
    React.render(<HudListening />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_listening", render, "HUD");
}

widgets.push({fn: HudListeningWidget, channel: "HUD"});