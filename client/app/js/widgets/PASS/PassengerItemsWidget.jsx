/** @jsx React.DOM */
var PassengerItems = React.createClass({
  render: function() {

    var connected = JSON.parse(this.props.connected);
    var sharing = JSON.parse(this.props.sharing);
    var items = JSON.parse(this.props.items);

    return (<div><div className="widget-box identity">
            <div className="connectivity">
              {connected.map(function(item) {
                return (<img key={item.icon} src={"/assets/images/" + item.icon + "." + item.itemType} className={item.itemClasses} />);
              })}
            <div className="sharing">
              {sharing.map(function(item) {
                return (<img key={item.icon} src={"/assets/images/" + item.icon + ".svg"} className={item.itemClasses} />);
              })}
            </div>
            <p className="temperature">{this.props.passengerTemp}º</p>
            </div>            
            </div>
            <div className="widget-box info">
              <h1>Reminder!</h1>
               <ul className="missing-items">
              {items.map(function(item) {
                return (<li><img key={item.icon} src={"/assets/images/" + item.icon + ".svg"} className={item.itemClasses} /></li>);
              })}
              </ul>
            </div></div>);
  }
});

function PassengerItemsWidget(broker) {
  function render(data) {
   
    React.render(<PassengerItems items={data.items} connected={data.connected} sharing={data.sharing} passengerTemp={data.temp} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_items", render, "PASS");
}

widgets.push({fn: PassengerItemsWidget, channel: "PASS"});