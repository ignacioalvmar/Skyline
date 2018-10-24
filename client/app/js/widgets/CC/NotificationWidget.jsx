/** @jsx React.DOM */
var Notify = React.createClass({
  render: function() {
    function onTick() {
      console.log("Timeout processing!");
    }

    return (<div className="widget-box modal">
              <img src="/assets/images/Icon-Close-Window.svg" className="close-modal" />
              <TimerBar timeoutValue={this.props.timeoutValue} onTick={onTick} onComplete={this.props.closeFunction} />
              <p>
                <img src={"/assets/images/" + this.props.icon + ".svg"} className={this.props.classes} />
              </p>
          </div>);
  }
});

function NotificationWidget(broker) {
  function render(data) {
    function closeHandler() {
      if (data.nextState) {
        broker.pub(data.nextState, {purgeHUD: data.clearHUDOnTransition});
      }
    }

    React.render(<Notify icon={data.icon} classes={data.classes} timeoutValue={data.timeoutValue} closeFunction={closeHandler}/>, document.getElementById(data.quadrant));
  }

  broker.sub("notify", render, "CC");
}

widgets.push({fn:NotificationWidget, channel: "CC"});