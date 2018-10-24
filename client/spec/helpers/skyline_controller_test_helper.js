function testController(controllerName, controllerFunction, bindings, consoleName) {
  return function() {
    describe("Testing controller: " + controllerName, function() {

      var socket = {};
      var subCalls = null;

      beforeEach(function() {
        init(consoleName);
        var spy = spyOn(demo, "sub");

        controllerFunction(socket);
        subCalls = spy.calls;
      });

      bindings.forEach(function(binding, index) {
        var topic = binding.topic;
        var handler = binding.handler;

        it("subscribes to " + topic, function() {
          var result = subCalls[index].args;
          var s = result[0]; // socket
          var t = result[1]; // topic
          var h = result[2]; // handler
          var c = result[4]; // console name

          expect(s).toBe(socket);
          expect(t).toBe(topic);
          expect(h).toBe(handler);
        });
      });
    });
  }
}