/** @jsx React.DOM */
var HUDMessage = React.createClass({
  render: function() {


    return (<div className="widget-box">
              <p className="message">
                <h1>{this.props.headerText}</h1><br />
                <span>{this.props.bodyText}</span>
              </p>
            </div>);
  }
});


function HUDMessageWidget(broker) {
  function render(data) {
    React.render(<HUDMessage headerText={data.headerText} bodyText={data.bodyText} />, document.getElementById(data.quadrant));
  }

  broker.sub("hud_message", render, "HUD");
}

widgets.push({fn: HUDMessageWidget, channel: "HUD"});