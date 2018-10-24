/** @jsx React.DOM */
var HudRoute = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/Icon-Street-Sign.svg" className="icon" /></p>
          <p className="message">Change route?</p>
          <p className="img-secondary"><em></em></p>
          <div className="route-options">
            <img src="/assets/images/Icon-Route-Favorite.svg" />
            <img src="/assets/images/Icon-Route-Scenic.svg" />
            <p>300ft</p>
          </div>
        </div>);
  }
});

function HudRouteWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudRoute />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_route_change", render, "HUD");
}

widgets.push({fn: HudRouteWidget, channel: "HUD"});