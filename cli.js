#!/usr/bin/env node

var fs = require('fs');
var chalk = require('chalk');
var ProgressBar = require('progress');
var yargs = require('yargs');
var Duration = require('duration');

var OPL3 = require('./opl3');
var LAA = require('./format/laa');
var MUS = require('./format/mus');
var WAV = require('./wav.js').WAV;
var package = require('./package.json');

var argv = yargs.usage(chalk.cyan('\nOPL3 emulator v' + package.version) + '\nUsage: opl3 [OPTIONS] <input file>')
	.example('opl3 --mp3 ./laa/dott_logo.laa')
	.describe('mp3', 'Export to MP3')
	.describe('wav', 'Export to WAV')
	.describe('laa', 'Use LAA format')
	.describe('mus', 'Use MUS format')
	.describe('play', 'Play after processing')
	.describe('help', 'You read that just now')
	.alias('h', 'help')
	.alias('p', 'play')
	.epilog(chalk.cyan('Copyright (c) 2016 IDDQD@doom.js'))
	.wrap(yargs.terminalWidth() - 1)
	.argv;

if (argv.help) yargs.showHelp();
else{
	
	var start = Date.now();

	console.log();
	console.log(chalk.cyan('OPL3 emulator v' + package.version));
	
	if (process.argv.length < 3){
		console.log(chalk.red('Input file required!'));
		process.exit(1);
	}
	
	var filename = process.argv[process.argv.length - 1];
	if (!fs.existsSync(filename)){
		console.log(chalk.red('Input file not found!'));
		process.exit(1);
	}
	
	var midiFormat;
	if (argv.laa || filename.split('.').pop().toLowerCase() == 'laa') midiFormat = LAA;
	else if (argv.mus || filename.split('.').pop().toLowerCase() == 'mus') midiFormat = MUS;
	else{
		console.log(chalk.red('Unknown file format!'));
		process.exit(1);
	}
	
	var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
	var ReadableStreamBuffer = require('stream-buffers').ReadableStreamBuffer;
	var writer = new WritableStreamBuffer({
		initialSize: (1024 * 1024),
		incrementAmount: (512 * 1024)
	});
	var reader = new ReadableStreamBuffer({
		frequency: 10,   // in milliseconds.
		chunkSize: 16 * 1024  // in bytes.
	});
	var lame = require('lame');
	var Speaker = require('speaker');

	// Create the Speaker instance
	var speaker;
	if (argv.play){
		speaker = new Speaker({
			channels: 2,          // 2 channels
			bitDepth: 16,         // 16-bit samples
			sampleRate: 49700     // 49,700 Hz sample rate
		});
	}

	var encoder;
	var mp3Filename;
	if (argv.mp3){
		// create the Encoder instance
		encoder = new lame.Encoder({
			// input
			channels: 2,        // 2 channels (left and right)
			bitDepth: 16,       // 16-bit samples
			sampleRate: 49700,  // 49,700 Hz sample rate

			// output
			bitRate: 128,
			outSampleRate: 22050,
			mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
		});
		mp3Filename = argv.mp3 == filename ? filename.slice(0, filename.lastIndexOf('.')) + '.mp3' : argv.mp3; 
		var mp3file = fs.createWriteStream(mp3Filename);
		reader.pipe(encoder);
		encoder.pipe(mp3file);
	}

	var buffer = fs.readFileSync(filename);
	var bar = new ProgressBar('Processing ' + chalk.yellow(process.argv[process.argv.length - 1]) + ' [:bar] :percent :etas', {
		width: 20,
		total: buffer.length
	});

	var player = new midiFormat(new OPL3(2));
	player.load(new Uint8Array(buffer));

	var pos = 0;
	var len = 0;
	var dlen = 0;
	var streamQueue = [];
	var streamLen = 0;
	while (player.update()){
		var d = player.refresh();
		var n = 4 * ((49700 * d) | 0);

		bar.tick(player.pos - pos);
		pos = player.pos;

		len += n;
		dlen += d;

		var arr = new Int16Array((n / 2) | 0);
		for (var i = 0, j = 0; i < n; i += 4, j += 2){
			arr.set(player.opl.read(), j);
		}

		var buf = new Buffer(arr.buffer);
		reader.put(buf);
		writer.write(buf);
		if (argv.play) speaker.write(buf);
	}

	reader.stop();
	writer.end();
	if (argv.play) speaker.end();

	var processBuffer = writer.getContents();
	
	var exportWav = function(){
		if (!argv.mp3) console.log();
		var wavFilename = argv.wav == filename || typeof argv.wav != 'string' ? filename.slice(0, filename.lastIndexOf('.')) + '.wav' : argv.wav;
		fs.writeFileSync(wavFilename, new Buffer(WAV(processBuffer, 49700)));
		console.log('WAV exported to ' + chalk.yellow(wavFilename));
		console.log('Finished in ' + chalk.yellow(new Duration(new Date(0), new Date(Date.now() - start)).toString('%S.%L') + 's'));
		if (argv.play) console.log(chalk.magenta('Playing audio...'));
		
		console.log();
	};
	
	if (argv.mp3){
		console.log();
		var mp3bar = new ProgressBar('MP3 encoding ' + chalk.yellow(mp3Filename) + ' [:bar] :percent :etas', {
			width: 20,
			total: processBuffer.length
		});
		reader.on('data', function(chunk){
			mp3bar.tick(chunk.length);
		});
		reader.on('end', exportWav);
	}else exportWav();

}