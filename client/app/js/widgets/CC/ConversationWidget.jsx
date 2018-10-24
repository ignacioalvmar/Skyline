/** @jsx React.DOM */
function ConversationWidget(broker) {

  var MAX_AUDIO = .5;

  function renderCoreView(data) {
    var completeHandler = function() {
      //broker.pub(StateEvents.TO_STATE_32, {purgeHUD: true});
    }

    //React.render(React.createElement(SpotifyView, {countdown: data.timeoutValue, onComplete: completeHandler}), document.getElementById(data.quadrant));
  }

  function renderPlayView(data) {

    //if (!player) { player = playSong(); }
    player = playSong(data);
    window.player = player;
    //var playingView = React.render(React.createElement(PlayingView, {player: player}), document.getElementById(data.quadrant));
    // player.ontimeupdate = function() {
    //   if (playingView.isMounted()) {
    //     playingView.setState({percent : (("" + (100 * player.currentTime / player.duration)).split("\.")[0]) + "%"});
    //   }

    // }

  }

  var player;
  function playSong(data) {
    var el = $('body')[0];
    if (el.mp3) {
      if (el.mp3.paused) {
       el.mp3 = new Audio(data.file);
       el.mp3.play();
      } else {
       el.mp3.pause();
       el.mp3 = new Audio(data.file);
       el.mp3.play();
      }
    } else {
      el.mp3 = new Audio(data.file);
      el.mp3.play();
    }

    el.mp3.loop = false;
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




  broker.sub("play_in_car_conversation", renderPlayView, "CC");


  broker.sub("fade_conversation_out", fadeAudioOut, "CC");
  broker.sub("fade_conversation_in", fadeAudioIn, "CC");

}

widgets.push({fn: ConversationWidget, channel: "CC"});

/** @jsx React.DOM */
function CallConversationWidget(broker) {

  var MAX_AUDIO = .5;

  function renderCoreView(data) {
    var completeHandler = function() {
      //broker.pub(StateEvents.TO_STATE_32, {purgeHUD: true});
    }

    //React.render(React.createElement(SpotifyView, {countdown: data.timeoutValue, onComplete: completeHandler}), document.getElementById(data.quadrant));
  }

  function renderPlayView(data) {
    console.log("test");
    //if (!player) { player = playSong(); }
    player = playSong();
    window.player = player;
    //var playingView = React.render(React.createElement(PlayingView, {player: player}), document.getElementById(data.quadrant));
    // player.ontimeupdate = function() {
    //   if (playingView.isMounted()) {
    //     playingView.setState({percent : (("" + (100 * player.currentTime / player.duration)).split("\.")[0]) + "%"});
    //   }

    // }

  }

  var player;
  function playSong() {
    var el = $('body')[0];
    if (el.mp3) {
      if (el.mp3.paused) {
       el.mp3 = new Audio("/assets/audio/conversation2.mp3");
       el.mp3.play();
      } else {
       el.mp3.pause();
       el.mp3 = new Audio("/assets/audio/conversation2.mp3");
       el.mp3.play();
      }
    } else {
      el.mp3 = new Audio("/assets/audio/conversation2.mp3");
      el.mp3.play();
    }

    el.mp3.loop = false;
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




  broker.sub("play_incoming_call_conversation", renderPlayView, "CC");


  broker.sub("fade_conversation_out", fadeAudioOut, "CC");
  broker.sub("fade_conversation_in", fadeAudioIn, "CC");

}

widgets.push({fn: CallConversationWidget, channel: "CC"});