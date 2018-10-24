/**
*  SoX controller for Skyline Platform
* Author: Victor Palacios @ victor.h.palacios.rivera@intel.com
*/

const EventEmitter = require('events').EventEmitter;
const spawn = require('child_process').spawn;
const util = require('util');
const fs = require('fs');
const dateTime = require('node-datetime');

var Sox = function Sox(options)
{
    EventEmitter.call(this);
    options = options || {}
    this.recording = false;
    this.cmd = options.sox_path || __dirname + '/sox';
    this.format = options.format || 'wav';
    this.recDevice = options.recordingDevice || '1';
    this.channels = options.channels || '2';
    this.bitRate = options.bitRate || '48000';
    this.bitDepth = options.bitDepth || '32';
    this.encoding = options.encoding || 'floating-point';
    this.format = options.format || 'wav';
    this.outputFile = options.outputFile || 'output.'+this.format;
    this.writeOutputFile = options.writeOutputFile || false;
    this.verbose = options.verbose || false;
};

util.inherits(Sox, EventEmitter);
module.exports = Sox;

//voice recording using sox
Sox.prototype.startRecording = function()
{    
    var self = this;

    if(self.recording) 
    {
        console.log('SoX is already recording, Ignoring request.');    
        return;
    }
    console.log('Launching SoX child process...');

    //new output file name
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d_H-M-S.N_');
    var filename = formatted + self.outputFile;

    //sox arguments
    self.cmdArgs = [
        '-t','waveaudio', self.recDevice,
        '-c',self.channels,
        '-r',self.bitRate,
        '-b',self.bitDepth,
        '-e',self.encoding,
        '-t',self.format,
        filename
    ];

    if(!self.verbose)// -q should be the first flag if present
      self.cmdArgs.unshift('-q');

    // spawn sox process to record selected mic
    var rec = spawn(self.cmd, self.cmdArgs, {stdin:'pipe'});
    self.recording = true;

    //save child process reference
    this.rec = rec;

    // configure stdout
    rec.stdout.setEncoding('utf8');
    rec.stdout.on('data', function(data)
    {
        console.log(data);
    });

    // configure stderr
    rec.stderr.setEncoding('utf8');
    rec.stderr.on('data', function(data)
    {
        console.log(data)
    });

    // terminated
    rec.on('exit', function(code, signal)
    {
        self.recording = false;
        console.log('SoX child process terminated. Code:'+code+", signal:"+signal);
    });
};

Sox.prototype.stopRecording = function()
{
    var self = this;
    if(self.recording)
    {
        console.log('Sending SIGINT signal to SoX child process...');
        self.rec.kill('SIGINT');
    }
    else
    {
        console.log('SoX is not recording, ignoring stop message.');
    }
}
