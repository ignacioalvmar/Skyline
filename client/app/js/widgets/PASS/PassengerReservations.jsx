
/** @jsx React.DOM */
var PassengerReservationsInitial = React.createClass({
  render: function() {

    return (<div><div className="widget-box dinner-listening">
          		<img src="/assets/images/Icon-Listening.gif" className="icon-listening" />
          		<button className="button-flexible">Dinner</button>
              <div className="loadingDinner">
                <div className="circle-1"></div>
                <div className="circle-2"></div>
                <div className="circle-3"></div>
              </div>
        	</div>
        	<div className="widget-box dinner-locations">
          		<img src="/assets/images/Icon-Yelp-Logo.svg" className="yelp-logo" />
        	</div></div>);
  }
});





function PassengerReservationInitial(broker) {
  var passengerDoneHandler = function() {
    broker.pub("reinitialize", {}, "PASS");
  }
  function render(data) {
    React.render(<PassengerReservationsInitial  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_reservations_initial", render, "PASS");
}

widgets.push({fn: PassengerReservationInitial, channel: "PASS"});

/**  Secondary reservation widget  */
var PassengerReservationsSecondary = React.createClass({
  render: function() {

    return (<div><div className="widget-box dinner-listening">
          	<img src="/assets/images/Icon-Listening.gif" className="icon-listening" />
          	<button className="button-flexible">Dinner</button>
          	<strong>…</strong>
          	<button className="button-flexible">Mexican</button>
              <div className="loadingDinner">
                <div className="circle-1"></div>
                <div className="circle-2"></div>
                <div className="circle-3"></div>
              </div>
        </div>
        <div className="widget-box dinner-locations">
        	<img src="/assets/images/Icon-Yelp-Logo.svg" className="yelp-logo" />
        	<div className="restaurants">
            	<dl>
              		<dt><img src="/assets/images/Icon-Lupes-Hat.svg" className="" /></dt>
              		<dd>Lupe’s <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
        		</dl>
            	<dl>
              		<dt><img src="/assets/images/Icon-Machotaco-Chili.svg" className="" /></dt>
              		<dd>Macho Taco <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
        		</dl>
            	<dl>
              		<dt><img src="/assets/images/Icon-Wakamole.svg" className="" /></dt>
              		<dd>Wakamole <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
            	</dl>
          	</div>
        </div></div>);
  }
});





function PassengerReservationSecondary(broker) {
  var passengerDoneHandler = function() {
    broker.pub("reinitialize", {}, "PASS");
  }
  function render(data) {
    React.render(<PassengerReservationsSecondary  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_reservations_secondary", render, "PASS");
}

widgets.push({fn: PassengerReservationSecondary, channel: "PASS"});

/**  Tertiary reservation widget  */
var PassengerReservationsTertiary = React.createClass({
  render: function() {

    return (<div><div className="widget-box dinner-listening">
          <img src="/assets/images/Icon-Listening.gif" className="icon-listening" />
          <button className="button-flexible">Dinner</button>
          <strong>…</strong>
          <button className="button-flexible">Mexican</button>
          <strong>…</strong>
          <button className="button-flexible">8PM</button>
              <div className="loadingDinner">
                <div className="circle-1"></div>
                <div className="circle-2"></div>
                <div className="circle-3"></div>
              </div>
        </div>
        <div className="widget-box dinner-locations">
          <img src="/assets/images/Icon-Yelp-Logo.svg" className="yelp-logo" />
          <div className="restaurants">
            <dl>
              <dt><img src="/assets/images/Icon-Lupes-Hat.svg" className="" /></dt>
              <dd>Lupe’s <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
            </dl>
            <dl>
              <dt><img src="/assets/images/Icon-Machotaco-Chili.svg" className="" /></dt>
              <dd>Macho Taco <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
            </dl>
            <dl>
              <dt><img src="/assets/images/Icon-Wakamole.svg" className="" /></dt>
              <dd>Wakamole <em><img src="/assets/images/Icon-Rating-Stars.svg" className="" /></em></dd>
            </dl>
          </div>
        </div>
        <div className="widget-box dinner-availability">
          <div className="schedule-driver">
            <img src="/assets/images/avatar-driver.jpg" className="avatar" />
            <button className="button-flexible open">Open</button>
            <button className="button-flexible">Busy</button>
            <button className="button-flexible open">Open</button>
          </div>
          <div className="schedule-calendar">
            <img src="/assets/images/Icon-Calendar.svg" />
            <button className="button-flexible">&#8672; 6pm &#8674;</button>
            <button className="button-flexible">&#8672; 7pm &#8674;</button>
            <button className="button-flexible target-time">&#8672; 8pm &#8674;</button>
          </div>
          <div className="schedule-passenger">
            <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
            <button className="button-flexible">Busy</button>
            <button className="button-flexible">Busy</button>
            <button className="button-flexible">Busy</button>
          </div>
        </div></div>);
  }
});





function PassengerReservationTertiary(broker) {
  var passengerDoneHandler = function() {
    broker.pub("reinitialize", {}, "PASS");
  }
  function render(data) {
    React.render(<PassengerReservationsTertiary  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_reservations_tertiary", render, "PASS");
}

widgets.push({fn: PassengerReservationTertiary, channel: "PASS"});

/**  initial listening  */
var PassengerReservationsListening = React.createClass({
  render: function() {

    return (<div><div className="widget-box dinner-listening">
          <img src="/assets/images/Icon-Listening.gif" className="icon-listening" />
         </div></div>);
  }
});





function PassengerReservationListening(broker) {
  var passengerDoneHandler = function() {
    broker.pub("reinitialize", {}, "PASS");
  }
  function render(data) {
    React.render(<PassengerReservationsListening  />, document.getElementById(data.quadrant));
  }

  broker.sub("show_passenger_reservations_listening", render, "PASS");
}

widgets.push({fn: PassengerReservationListening, channel: "PASS"});
