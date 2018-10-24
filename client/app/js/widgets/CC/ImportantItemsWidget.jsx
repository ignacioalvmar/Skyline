/** @jsx React.DOM */
var ImportantItemList = React.createClass({
  render: function() {
    // console.log("Show rain:", this.props.rain);

    // var showRain = this.props.rain;
    // var rainIndicator;
    // if (showRain) {
    //   var timestamp = new Date(Date.now() + 1000 * 60 * 60 * 2);
    //   var hours = timestamp.getHours();
    //   var minutes = timestamp.getMinutes();
    //   function formatHours(hours) {
    //     if (hours > 12) { return hours - 12; }
    //     if (hours === 0) { return 12; }
    //     return hours;
    //   }
    //   rainIndicator = (<p className="rain-time">
    //                     <img src="/assets/images/Icon-Rain-Cloud.svg" className="icon" /> <em>at {formatHours(hours) + ":" + minutes} </em>
    //                   </p>);
    // } else {
    //   rainIndicator = <span></span>
    // }

    return ( <div className="widget-box">
        <img src="/assets/images/Icon-Close-Window.svg" className="modal-close" />
        <div className="modal-circle">
          <div className="inner">
            <p><img src={"/assets/images/" + this.props.iconName + ".svg"} className={this.props.itemClass} /></p>
            <p>{this.props.copyText}</p>
          </div>
        </div></div>);
  }
});

function ImportantItemsWidget(broker) {
  function render(data) {
    console.log("Rendering important widgets now:", data);
    React.render(<ImportantItemList iconName={data.iconName} itemClass={data.itemClass} copyText={data.copyText} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_important_items", render, "CC");
}

widgets.push({fn: ImportantItemsWidget, channel: "CC"});