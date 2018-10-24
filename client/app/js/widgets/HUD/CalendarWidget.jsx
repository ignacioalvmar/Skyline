/** @jsx React.DOM */
var CalendarView = React.createClass({
  render: function() {
    var messageImage;
    var messageText;

    if (this.props.message.icon) {
      messageImage = (<img src={"/assets/images/" + this.props.message.icon} />)
    }

    var previousDayOfWeek;
    if (this.props.showLastWeek) {
      previousDayOfWeek = (<p className="day-of-week previous">
                <strong>2:45 p.m.</strong>
                School Pickup<br />
                100 B St
              </p>)
    }

    if (this.props.message.isEmphasized) {
      messageText = (<em>{this.props.message.text}</em>)
    } else {
      messageText = this.props.message.text
    }

    return (<div className="widget-box calendar">
        <h2>{this.props.day}:</h2>
        {previousDayOfWeek}
        <p className="day-of-week">
          <strong>{this.props.time}</strong>
          Dance Studio<br />
          200 B St
        </p>
        <p className={this.props.message.messageClass}>
          {messageImage}
          {messageText}
        </p>
      </div>);
  }
});

function CalendarWidget(broker) {
  function render(data) {
    React.render(<CalendarView day={data.day} time={data.time} place_name={data.place_name} address={data.address} message={data.message} showLastWeek={data.showLastWeek} />, document.getElementById(data.quadrant));
  }

  broker.sub("calendar_event", render, "HUD");
}

widgets.push({fn: CalendarWidget, channel: "HUD"});