/*
    set contollers
*/

exports.index = function(req, res){
  res.render('index.html');
};

exports.mapTest = function(req, res) {
    res.render('MapTester.html');
};

exports.panelTest = function(req, res) {
    res.render("panelTest.html");
};

exports.buckSimulator = function(req, res) {
    res.render('BuckSimulator.html');
};

exports.taxiDemo = function(req, res) {
    res.render("taxiDemo.html");
};

exports.demo = function(req, res) {
  res.render("demo.html");
}

exports.console = function(req, res) {
    var consoles = require('../consoleDefinitions');
    var console = req.params.consoleId;

    res.render("console",consoles[console]);
};






