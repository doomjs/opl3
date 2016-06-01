# OPL3 emulator

OPL3 emulator usable as a CLI tool or as a library.

Ported from [Yamaha YMF262 (OPL3) Emulator by Robson Cozendey](http://opl3.cozendey.com/).

## Using from command line

Install OPL3 emulator as ```npm install -g opl3```.

```
OPL3 emulator v0.2.0
Usage:: opl3 <input file> [OPTIONS]

Options:
  --mp3         Export to MP3
  --wav         Export to WAV
  --ogg         Export to OGG
  --laa         Use LAA format
  --mus         Use MUS format
  -h, --help    You read that just now
  -p, --play    Play after processing
  -o, --output  Output directory

Examples:
  opl3 ./laa/dott_logo.laa --mp3 dott_logo.mp3 --wav dott_logo.wav --ogg dott_logo.ogg

Copyright (c) 2016 IDDQD@doom.js
```

Accepts glob patterns as input file, like ```opl3 **/*.mus```.

## Using from JavaScript

Use OPL3 and a format handler (like LAA) to process:

```javascript
var fs = require('fs');

var OPL3 = require('opl3').OPL3;
var LAA = require('opl3').format.LAA;
var Player = require('opl3').Player;
var WAV = require('opl3').WAV;

var player = new Player(LAA);
player.load(fs.readFileSync('./laa/dott logo.laa'), function(err, result){
    if (err) return console.log(err);
    fs.writeFileSync('./dott.wav', new Buffer(WAV(result, 49700)));
    console.log('done!');
}, function(msg){
    // msg format:
    // { cmd: 'position', samples: 0 /* bytes */, duration: 0 /* seconds */ }
    // { cmd: 'progress', value: 100 /* percent */ }
    // { cmd: 'end' }
    process.stdout.write('.');
});
```

## Supported format types

* LAA: LucasArts music format (used in Day of the Tentacles)
* MUS: Doom music format

## Supported audio export formats

* WAV: PCM audio WAVE
* MP3: using [node-lame](https://github.com/TooTallNate/node-lame)
* OGG: using [node-vorbis](https://github.com/TooTallNate/node-vorbis) and [node-ogg](https://github.com/TooTallNate/node-ogg)
* Audio playback: using [node-speaker](https://github.com/TooTallNate/node-speaker)