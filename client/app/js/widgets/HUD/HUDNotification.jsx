/** @jsx React.DOM */
var HUDNotification = React.createClass({


  render: function() {

    if(this.props.audioFile != null){
      var el = $('body')[0];
      if (el.mp3) {
        if (el.mp3.paused) {
         el.mp3 = new Audio(this.props.audioFile);
         el.mp3.play();
        } else {
         el.mp3.pause();
         el.mp3 = new Audio(this.props.audioFile);
         el.mp3.play();
        }
      } else {
        el.mp3 = new Audio(this.props.audioFile);
        el.mp3.play();
      }

      el.mp3.loop = false;
      el.mp3.volume = 0.5;
    }
    
    var primary_icons = JSON.parse(this.props.primary_icons);
    var secondary_icons = JSON.parse(this.props.secondary_icons);
    var secondary_icon_class = this.props.use_mini_icons ? "mini" : "";
    var message_text = this.props.message_text;
    var message_icons = JSON.parse(this.props.message_icons);

    return (<div className="widget-box">
              <p className="img-primary">
                {primary_icons.map(function(primary_icon) {
                  return (<img src={"/assets/images/" + primary_icon.url} className={primary_icon.iconClass} key={primary_icon.url} />)
                })}
              </p>
              <p className="message">
                <bdi>{message_text}</bdi><br />
                {message_icons.map(function(icon) {
                  return (<img src={"/assets/images/" + icon.url} className={icon.isDisabled ? "disabled" : ""} key={icon.url}/>)
                })}
              </p>

              <div className="passenger-privacy">
              <p className={"" + secondary_icon_class}>
                {secondary_icons.map(function(secondary_icon) {
                  if (secondary_icon.url) {
                    if (secondary_icon.isVideo) {
                      return (<video src={"/assets/images/" + secondary_icon.url} autoPlay loop className={secondary_icon.iconClass} key={secondary_icon.url} />);
                    } else {
                      return (<img src={"/assets/images/" + secondary_icon.url} className={secondary_icon.iconClass} key={secondary_icon.url}/>);
                    }
                  } else if (secondary_icon.paragraph) {
                    return (<p className={secondary_icon.iconClass}>Safe shoulder in <strong>300 ft</strong></p>)
                  }else {
                    return (<em key={secondary_icon.text}>{secondary_icon.text}</em>)
                  }

                })}
              </p>
              </div>
            </div>);
  }
});

function createHUDNotification(primary_icons, secondary_icons, message, isMini) {
  if (!message) { message = { text: "", icons: [] }; }
  if (!message.icons) { message.icons = []; }
  if (!message.text) { message.text = ""; }

  return {
    primary_icons: primary_icons,
    secondary_icons: secondary_icons,
    message: message,
    use_mini_icons: isMini
  };
}

function HUDNotificationWidget(broker) {
  function render(data) {
    React.render(<HUDNotification primary_icons={data.primary_icons} audioFile={data.audioFile} secondary_icons={data.secondary_icons} message_text={data.message_text} message_icons={data.message_icons} secondary_icon_class={data.use_mini_icons} />, document.getElementById(data.quadrant));
  }

  broker.sub("notify", render, "HUD");
}

widgets.push({fn: HUDNotificationWidget, channel: "HUD"});