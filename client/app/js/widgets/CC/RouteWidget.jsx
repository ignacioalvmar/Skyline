/** @jsx React.DOM */
var RouteView = React.createClass({
  render: function() {
    return (<div className="widget-box">
              <p className="route-type-icon"><img src={"/assets/images/" + this.props.icon + ".svg"} /></p>
              <dl className="route-type-description">
                <dt>{this.props.route_name}</dt>
                <dd>ETA: {this.props.expected_time} min / Eco level: {this.props.eco_level}</dd>
              </dl>
            </div>);
  }
});

var RerouteView = React.createClass({
  render: function() {
    return (<div className="widget-box">
              <div className="route-option selected" onClick={this.props.handler} >
                <p className="route-type-icon"><img src="/assets/images/Icon-Circle-Heart.svg" /></p>
                <dl className="route-type-description">
                  <dt>Favorite Route</dt>
                  <dd>Travel time: 10 min (20 min early)</dd>
                </dl>
              </div>
              <div className="route-option" onClick={this.props.handler}>
                <p className="route-type-icon"><img src="/assets/images/Icon-Circle-Scenic.svg" /></p>
                <dl className="route-type-description">
                  <dt>Scenic Route</dt>
                  <dd>Travel time: 10 min (20 min early)</dd>
                </dl>
              </div>
            </div>);
  }
});

function RouteWidget(broker) {
  function renderRoute(data) {
    React.render(<RouteView icon={data.icon} route_name={data.route_name} expected_time={data.expected_time} eco_level={data.eco_level} />, document.getElementById(data.quadrant));
  }

  function renderReroute(data) {
    function handler() {
      broker.pub("zoom_in", {}, "CC");
      broker.pub("show_alt_route", {route:"economic"}, "CC"); // select new route
      broker.pub(StateEvents.TO_STATE_33, {purgeHUD: true}); // return to default driving state
    }

    React.render(<RerouteView handler={handler} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_route", renderRoute, "CC");
  broker.sub("show_reroute", renderReroute, "CC");
}

widgets.push({fn: RouteWidget, channel: "CC"});