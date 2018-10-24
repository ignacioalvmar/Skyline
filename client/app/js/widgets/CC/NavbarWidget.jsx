/** @jsx React.DOM */
var ShowNav = React.createClass({
  componentDidMount: function(){

    var slideOption = this.props.slideOption;
    var el = this.getDOMNode();
    if(slideOption == "show"){
      $(el).slideDown('slow');
    }else if(slideOption == "hide"){
      $(el).slideUp('slow');
    }else{
      $(el).show();
    }
     

  },
  render: function() {

    if(typeof(this.props.navbarItems) == 'undefined' || this.props.navbarItems == null){
      this.props.navbarItems = [
        {icon: "/assets/images/Icon-Nav-Home.svg", itemClass: "icon-home" },
        {icon: "/assets/images/Icon-Seat.svg", itemClass: "icon-media" },
        {icon: "/assets/images/Icon-Mobile-Phone2.png", itemClass: "icon-phone" },
        {icon: "/assets/images/Icon-Settings.svg", itemClass: "icon-settings" }
      ];
    }else if(!this.props.navbarItems.map){
      this.props.navbarItems = JSON.parse(this.props.navbarItems);
    }   

  
    return (
      <nav id="navbar">
          <ul>
              {this.props.navbarItems.map(function(item) {
                return (<li><img key={item.icon} src={item.icon} className={item.itemClass} /></li>);
              })}
          </ul>
        </nav>);
  }
});

function NavbarWidget(broker) {
  function render(data) {
    React.render(<ShowNav slideOption={data.slideOption} navbarItems={data.navbarItems} />, document.getElementById(data.quadrant));
  }

  broker.sub("show_navbar", render, "CC");
}

widgets.push({fn: NavbarWidget, channel: "CC"});