/** @jsx React.DOM */
var DinnerStepOne = React.createClass({
  render: function() {


    return (<div><img src="/assets/images/Icon-Close-Window.svg" className="modal-close" />
        <div className="modal-circle">
          <div className="dinner">
            <img src="/assets/images/avatar-driver.jpg" className="avatar" />
            <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
            <dl>
              <dt><img src="/assets/images/Icon-Wakamole.svg" /></dt>
              <dd>
                Wakamole<br />
                <img src="/assets/images/Icon-Rating-Stars.svg" className="icon-rating" />
              </dd>
            </dl>
            <h2>PARTY OF 2</h2>
            <p>8:00 p.m.</p>
          </div>
        </div></div>);
  }
});

function ShowDinnerStepOneWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<DinnerStepOne />, document.getElementById(data.quadrant));
  }

  broker.sub("show_dinner_step_one", render, "CC");
}

widgets.push({fn: ShowDinnerStepOneWidget, channel: "CC"});


var DinnerStepTwo = React.createClass({
  render: function() {


    return (<div><img src="/assets/images/Icon-Close-Window.svg" className="modal-close" />
        <div className="modal-circle">
          <div className="dinner booking">
            <img src="/assets/images/avatar-driver.jpg" className="avatar" />
            <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
            <dl>
              <dt><img src="/assets/images/Icon-Opentable-Logo.svg" /></dt>
              <dd>Booking Party of 2</dd>
            </dl>
            <h2><img src="/assets/images/Icon-Wakamole.svg" /> <span>Wakamole</span></h2>
            <p>8:00 p.m.</p>
          </div>
        </div></div>);
  }
});

function ShowDinnerStepTwoWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<DinnerStepTwo />, document.getElementById(data.quadrant));
  }

  broker.sub("show_dinner_step_two", render, "CC");
}

widgets.push({fn: ShowDinnerStepTwoWidget, channel: "CC"});


var DinnerStepThree = React.createClass({
  render: function() {


    return (<div><img src="/assets/images/Icon-Close-Window.svg" className="modal-close" />
        <div className="modal-circle">
          <div className="dinner booked">
            <img src="/assets/images/avatar-driver.jpg" className="avatar" />
            <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
            <dl>
              <dt>RESERVATION CONFIRMED</dt>
              <dd>Party of 2 - 8:00 p.m.</dd>
            </dl>
            <h2><img src="/assets/images/Icon-Wakamole.svg" /> <span>Wakamole</span></h2>
            <p><span>Added</span> <img src="/assets/images/Icon-Calendar.svg" /></p>
          </div>
        </div></div>);
  }
});

function ShowDinnerStepThreeWidget(broker) {
  function render(data) {
    console.log("Rendering passenger destination widgets now:", data);
    React.render(<DinnerStepThree />, document.getElementById(data.quadrant));
  }

  broker.sub("show_dinner_step_three", render, "CC");
}

widgets.push({fn: ShowDinnerStepThreeWidget, channel: "CC"});