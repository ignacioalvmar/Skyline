/** @jsx React.DOM */
var SpotifyView = React.createClass({
  render: function() {
    return (
      <div className="widget-box" onClick={this.props.onComplete}>
        <img src="/assets/images/icon-music-play.svg" className="will-play" />
        <TimerBar timeoutValue={this.props.countdown} />
        <h1>Selected for you:</h1>
        
        <p><button className="button-flexible song-title"><em>80s One Hit Wonders</em><span></span> <em><em className="timer">
        <CountdownTimer initialTimeRemaining={this.props.countdown} completeCallback={this.props.onComplete} prefixText="Playing&nbsp;in&nbsp;" /></em></em>
            <span className="share-relevance">
              <span className="driver"></span>
              <span className="passenger"></span>
            </span>
        </button></p>
        <p className="shared"><img src="/assets/images/Shared-2.svg" /></p>
        <div className="shared-avatars">
          <img src="/assets/images/avatar-driver.jpg" className="avatar" />
          <img src="/assets/images/avatar-passenger.jpg" className="avatar" />
        </div>
        <h2>Other Media Sources</h2>
        <p className="media-sources">
          <strong><img src="/assets/images/Icon-iPod.svg" /></strong>
          <strong><img src="/assets/images/Icon-Spotify.svg" /></strong>
          <strong><img src="/assets/images/Icon-Pandora.svg" /></strong>
          <strong><img src="/assets/images/Icon-Audio-Mute.svg" /></strong>
        </p>
      </div>);
  }
});


var PlayingView = React.createClass({
  getInitialState: function() {
    return {percent: "0"};
  },
  render: function() {
    var self = this;

    return (<div><div className="widget-box third">
          <img src="/assets/images/avatar-driver.jpg" className="avatar" />
          <h1>
            <span className="highlight">
              <span>70</span>
              <span>º</span>
            </span>
          </h1>
          <p>
            <img src="/assets/images/Icon-Seat.svg" className="icon-seat" />
          </p>
        </div>
        <div className="widget-box two-thirds">
          <div className="audio-player">
            <img src="/assets/images/Shared-Mini-2.svg" className="shared-mini" />
            <div className="sharers">
              <img src="/assets/images/avatar-driver.jpg" className="avatar driver" />
              <img src="/assets/images/avatar-passenger.jpg" className="avatar passenger" />
            </div>
            <div className="cover-art">
              <img src="/assets/images/music-cover.jpg" />
            </div>
            <div className="player">
              <p className="description"><strong>I Can’t Wait</strong> Nu Shooz</p>
              <div className="progress-bar">
                <div className="progressbar-container">
<ProgressBar completed={this.state.percent} color="#58c1e2" />
                </div>
              </div>
              <p className="controls">
                <img src="/assets/images/Icon-Audio-Controls.svg" />
              </p>
            </div>
          </div>
        </div></div>);
  }
});

var MediaSettingsView = React.createClass({
  render: function() {
    return (<div className="widget-box modal">
              <img src="/assets/images/Icon-Close-Window.svg" className="close-modal" />
              <TimerBar timeoutValue={this.props.timeoutValue} onComplete={this.props.closeFunction}/>
              <h1>Your Media</h1>
              <p><button className="button-flexible" onClick={this.props.closeFunction}><img src="/assets/images/Icon-Pandora.svg" /> <em>80s One Hit Wonders</em></button></p>
              <h2>Selected for You</h2>
              <p><button className="button-flexible"><img src="/assets/images/Icon-Podcast.svg" /> <em>Podcast: Serial </em></button></p>
              <p><button className="button-flexible"><img src="/assets/images/Icon-Audiobook.svg" /> <em>Audiobook: Hunger Games</em></button></p>
              <h2>Other Media Sources</h2>
              <p className="media-sources">
                <strong><img src="/assets/images/Icon-iPod.svg" /></strong>
                <strong><img src="/assets/images/Icon-Spotify.svg" /></strong>
                <strong><img src="/assets/images/Icon-Pandora.svg" /></strong>
                <strong><img src="/assets/images/Icon-Audio-Mute.svg" /></strong>
              </p>
            </div>);
  }
});

function SpotifyWidget(broker) {

  var MAX_AUDIO = .5;

  function renderCoreView(data) {
    var completeHandler = function() {
      broker.pub(StateEvents.TO_STATE_32, {purgeHUD: true});
    }

    React.render(<SpotifyView countdown={data.timeoutValue} onComplete={completeHandler}/>, document.getElementById(data.quadrant));
  }

  function renderPlayView(data) {
    if (!player) { player = playSong(); }
    window.player = player;
    var playingView = React.render(<PlayingView player={player} />, document.getElementById(data.quadrant));
    player.ontimeupdate = function() {
      if (playingView.isMounted()) {
        playingView.setState({percent : (("" + (100 * player.currentTime / player.duration)).split("\.")[0]) + "%"});
      }

    }

  }

  var player;
  function playSong() {
    var el = $('body')[0];
    if (el.mp3) {
      if (el.mp3.paused) {
        el.mp3.pause();
      el.mp3 = new Audio("/assets/audio/music.mp3");
      el.mp3.play();
      } else {
        el.mp3.pause();
      el.mp3 = new Audio("/assets/audio/music.mp3");
      el.mp3.play();        
      }
    } else {
      el.mp3 = new Audio("/assets/audio/music.mp3");
      el.mp3.play();
    }

    el.mp3.loop = true;
    el.mp3.volume = MAX_AUDIO;
    return el.mp3;
  }

  var fadeAudioOut = function() {
    if (player) {
      function reduceValue() {
        if (player.volume > 0) {
          player.volume -= .1;
        }

        if (player.volume < .1) {
          player.volume = 0;
          player.pause();
        } else {
          setTimeout(reduceValue, 50);
        }
      }

      reduceValue();
    }
  };

  var fadeAudioIn = function() {
    if (player) {
      function increaseValue() {
        if (player.paused) {
          player.play();
        }

        if (player.volume < MAX_AUDIO) {
          if (player.volume + .1 >= MAX_AUDIO) {
            player.volume = MAX_AUDIO
          } else {
            player.volume += .1;
          }
        }

        if (player.volume === MAX_AUDIO) {
        } else {
          setTimeout(increaseValue, 50);
        }
      }

      increaseValue();
    }
  };

  function renderSettings(data) {
    var onSettingsClose = function() {
      broker.pub(StateEvents.TO_STATE_32, {});
    }

    React.render(<MediaSettingsView closeFunction={onSettingsClose} timeoutValue={data.timeoutValue} />, document.getElementById(data.quadrant));
  }


  broker.sub("show_spotify", renderCoreView, "CC");
  broker.sub("play_spotify", renderPlayView, "CC");
  broker.sub("show_media_settings", renderSettings, "CC");

  broker.sub("fade_audio_out", fadeAudioOut, "CC");
  broker.sub("fade_audio_in", fadeAudioIn, "CC");

}

widgets.push({fn: SpotifyWidget, channel: "CC"});