var assert = require("assert");
var chai = require("chai"), expect = chai.expect, should = chai.should();

var setupManager = require('../setupManager');

describe('setUpManager', function() {
    it('should exist', function() {
        should.exist(setupManager, 'setup manager does not exist');
    });

    it ('should have a HUD property', function() {
        should.exist(setupManager.HUD);
    });

    it('should have sub properties of HUD that are widget and layout', function() {
        should.exist(setupManager.HUD.widgets);
        should.exist(setupManager.HUD.layout);
    });
})