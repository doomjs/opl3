# OPL3 emulator

OPL3 emulator usable as a CLI tool or as a library.

Ported from [Yamaha YMF262 (OPL3) Emulator by Robson Cozendey](http://opl3.cozendey.com/).

## Using from command line

Install OPL3 emulator as ```npm install -g opl3```.

```
OPL3 emulator v0.1.3
Usage: opl3 [OPTIONS] <input file>

Options:
  --mp3       Export to MP3
  --wav       Export to WAV
  --laa       Use LAA format
  --mus       Use MUS format
  -h, --help  You read that just now
  -p, --play  Play after processing

Examples:
  opl3 --mp3 ./laa/dott_logo.laa

Copyright (c) 2016 IDDQD@doom.js
```

## Using from JavaScript

Use OPL3 and a format handler (like LAA) to process:

```javascript
var OPL3 = require('opl3').OPL3;
var LAA = require('opl3').format.LAA;

var player = new LAA(new OPL3(2));
player.load(new Uint8Array(buffer));

var len = 0;
var dlen = 0;
while (player.update()){
    var d = player.refresh();
    var n = 4 * ((49700 * d) | 0);

    len += n;
    dlen += d;

    var arr = new Int16Array((n / 2) | 0);
    for (var i = 0, j = 0; i < n; i += 4, j += 2){
        arr.set(player.opl.read(), j);
    }

    // use arr buffer data
}
```