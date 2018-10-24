/** @jsx React.DOM */
var HudDinnerFirst = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/avatar-passenger.jpg" className="avatar" />
          <img src="/assets/images/Icon-Phone-revised.png" className="icon-calling" />
          </p>
          <p className="message"></p>
          <p className="img-secondary"><em></em></p>
          <img src="/assets/images/Icon-Listening.gif" className="icon-listening-secondary" />
        </div>);
  }
});

function HudDinnerFirstWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudDinnerFirst />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_dinner_first", render, "HUD");
}

widgets.push({fn: HudDinnerFirstWidget, channel: "HUD"});

/** @jsx React.DOM */
var HudDinnerSecond = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/avatar-passenger.jpg" className="avatar" />
          <img src="/assets/images/Icon-Phone-revised.png" className="icon-calling" />
          </p>
          <p className="message"><img src="/assets/images/Icon-Wakamole.svg" className="icon-special" />  Wakamole 8 p.m.</p>
          <p className="img-secondary"><em></em></p>
          <img src="/assets/images/Icon-Listening.gif" className="icon-listening-secondary" />
        </div>);
  }
});

function HudDinnerSecondWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudDinnerSecond />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_dinner_second", render, "HUD");
}

widgets.push({fn: HudDinnerSecondWidget, channel: "HUD"});

/** @jsx React.DOM */
var HudDinnerThird = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/avatar-passenger.jpg" className="avatar" />
          <img src="/assets/images/Icon-Phone-revised.png" className="icon-calling" />
          </p>
          <p className="message"><img src="/assets/images/Icon-Open-Table.svg" className="icon-special" /> Booking...</p>
          <p className="img-secondary"><em></em></p>
        </div>);
  }
});

function HudDinnerThirdWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudDinnerThird />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_dinner_third", render, "HUD");
}

widgets.push({fn: HudDinnerThirdWidget, channel: "HUD"});


/** @jsx React.DOM */
var HudDinnerFourth = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/avatar-passenger.jpg" className="avatar" />
          <img src="/assets/images/Icon-Phone-revised.png" className="icon-calling" />
          </p>
          <p className="message"><img src="/assets/images/Icon-Open-Table.svg" className="icon-special" /> Booked 8 p.m.</p>
          <p className="img-secondary"><em></em></p>
        </div>);
  }
});

function HudDinnerFourthWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudDinnerFourth />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_dinner_fourth", render, "HUD");
}

widgets.push({fn: HudDinnerFourthWidget, channel: "HUD"});

/** @jsx React.DOM */
var HudDinnerFifth = React.createClass({
  render: function() {


    return (<div className="widget-box">
          <p className="img-primary"><img src="/assets/images/avatar-passenger.jpg" className="avatar" />
          <img src="/assets/images/Icon-Phone-red.png" className="icon-calling" />
          </p>
          <p className="message"></p>
          <p className="img-secondary"><em></em></p>
        </div>);
  }
});

function HudDinnerFifthWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<HudDinnerFifth />, document.getElementById(data.quadrant));
  }

  broker.sub("show_hud_dinner_fifth", render, "HUD");
}

widgets.push({fn: HudDinnerFifthWidget, channel: "HUD"});