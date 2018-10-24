describe("demo pubsub utility", function() {
  var sock, demo;

  beforeEach(function() {
    sock = {
      on: jasmine.createSpy(),
      emit: jasmine.createSpy()
    };

    demo = initPubsub();
  });

  describe("it defines a pub function", function() {
    var socket;
    var topic;
    var payload;
    var consoleName;

    beforeEach(function() {
      socket = sock;
      topic = "mock_topic";
      payload = {};
      consoleName = "CONSOLE_NAME"

      demo.pub(socket, topic, payload, consoleName);
    });

    it("which invokes socket.emit with arguments derived from its inputs", function() {
      expect(socket.emit).toHaveBeenCalledWith("consoleEvent", {eventName: "demo." + topic, console: consoleName, message: payload})
    });
  });

  describe("it defines a sub function", function() {
    var socket;
    var topic;
    var handler;
    var consoleName;

    beforeEach(function() {
      socket = sock;
      topic = "mock_topic";
      handler = function mock_handler() {};
      consoleName = "CONSOLE_NAME";

      demo.sub(socket, topic, handler, consoleName);
    });

    it("which invokes socket.emit with a subscription message", function() {
      expect(sock.emit).toHaveBeenCalledWith("subscribe", { name: "demo." + topic, console: consoleName });
    });

    it("which invokes socket.on to associate the provided handler with the provided topic", function() {
      expect(sock.on).toHaveBeenCalledWith("demo." + topic, handler);
    });
  });

});