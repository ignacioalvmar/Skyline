/** @jsx React.DOM */
var FloorPlan = React.createClass({
  render: function() {
  	console.log('HERE');
    return (<div className="widget-box">
      <img src="/assets/images/Icon-Close-Window.svg" className="modal-close" />
        <div className="modal-circle">
          <div className="inner floor-plan">
            <p>
            	<img src="/assets/images/Floorplan.svg" className="floor-plan" />
            </p>
          </div>
        </div>
    </div>);
  }
});

function FloorPlanWidget(broker) {
  function render(data) {
    React.render(<FloorPlan />, document.getElementById(data.quadrant));
  }

  broker.sub("show_floorplan", render, "CC");
}

widgets.push({fn: FloorPlanWidget, channel: "CC"});