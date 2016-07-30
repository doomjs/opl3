# OPL3 emulator

OPL3 emulator usable as a CLI tool or as a library.

Ported from [Yamaha YMF262 (OPL3) Emulator by Robson Cozendey](http://opl3.cozendey.com/).

## Using from command line

Install OPL3 emulator as ```npm install -g opl3```.

```
OPL3 emulator v0.4.1
Usage: opl3 <input file> [OPTIONS]

Options:
  --mp3            Export to MP3
  --wav            Export to WAV
  --ogg            Export to OGG
  --mid            Export to MIDI
  --laa            Use LAA format
  --mus            Use MUS format
  --dro            Use DRO format
  --imf            Use IMF format
  --raw            Use RAW format
  -h, --help       You read that just now
  -i, --genmidi    Use external GENMIDI lump (only MUS format)
  -n, --normalize  PCM audio normalization (default on, turn off with -n0)
  -p, --play       Play after processing
  -o, --output     Output directory

Examples:
  opl3 D_E1M1.mus

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
});
player.on('progress', function(value){
    process.stdout.write('.');
});
```

To convert source (in LAA format) to raw PCM audio, you can use the ```Readable``` stream approach:

```javascript
var fs = require('fs');
var OPL3 = require('opl3').OPL3;
var LAA = require('opl3').format.LAA;
var Player = require('opl3').Player;

var player = new Player(LAA);
var file = fs.createWriteStream('./dott.pcm');

player.pipe(file);
player.load(fs.readFileSync('./laa/dott logo.laa'));
player.on('progress', function(value){
    process.stdout.write('.');
});
```

Convert source DRO to MP3 using [node-lame](https://github.com/TooTallNate/node-lame):

```javascript
var fs = require('fs');
var lame = require('lame');
var OPL3 = require('./').OPL3;
var LAA = require('./').format.LAA;
var Player = require('./').Player;

var player = new Player(LAA);
var file = fs.createWriteStream('./dott.mp3');
var encoder = new lame.Encoder({
    // input
    channels: 2,        // 2 channels (left and right)
    bitDepth: 16,       // 16-bit samples
    sampleRate: 49700   // 49,700 Hz sample rate
});

player.pipe(encoder);
encoder.pipe(file);

player.load(fs.readFileSync('./laa/dott logo.laa'));
player.on('progress', function(value){
    process.stdout.write('.');
});
```

## Using in a browser

OPL3 is also available as a Bower package, install with ```bower install opl3```.

If installed from Bower, include OPL3 client library as:

```html
<script src="bower_components/opl3/dist/opl3.min.js"></script>
```

OPL3 client library is supporting UMD. When included as a global script, the library is available as ```window.OPL3```.  If ```WebWorker``` support is available in the browser, the library will automatically use a ```Worker``` to process audio in the background. You can find a browser example [here](https://raw.githubusercontent.com/doomjs/opl3/master/example/simple.html).

The OPL3 client library has a built-in realtime playback feature using Web Audio API, see [here](https://raw.githubusercontent.com/doomjs/opl3/master/example/webaudio.html).
See an example [here](https://raw.githubusercontent.com/doomjs/opl3/master/example/pico.html) for realtime playback using [pico.js](https://github.com/mohayonao/pico.js).

## Class: Player

```Player``` is a Readable stream, with extra events.

#### new Player(format[, options])

* ```format``` &lt;FormatHandler&gt; Any format handler included in ```opl3``` module or a custom format handler.
* ```options``` &lt;Object$gt; Optional options object.

```options``` properties are:
* *normalization*: ```true``` to enable normalization (not available in realtime), default is ```false```.
* *bitDepth*: set bit depth of output PCM audio (```16``` or ```32```), default is ```16```.
* *bufferSize*: size of audio chunk buffer for a single channel, default is ```64``` for realtime playback.
* *sampleRate*: set sample rate of output PCM audio, default is ```49700```.
* *instruments*: only supported in MUS format handler, override default GENMIDI instruments. This can be a raw lump file extracted from a WAD file or a JSON exported with [WAD Commander](https://github.com/doomjs/wadcmd).
* *prebuffer*: prebuffer size in milliseconds for realtime audio playback, default is ```200```. Set this value to ```-1``` if you want to disable any prebuffering.
* *volume*: realtime audio playback starting volume, default is ```1```.
* *disableWorker*: force processing on main thread.

#### player.load(buffer[, callback])

* ```buffer``` &lt;Buffer&gt; | &lt;ArrayBuffer&gt; Source buffer
* ```callback``` &lt;Function&gt; Optional callback when the audio processing is finished (including normalization if enabled). The result PCM audio buffer is passed to the callback function as an ```ArrayBuffer```.
* Return: ```Promise```

Load source buffer for audio processing and start processing immediately. Result PCM audio buffer is 2-channel (stereo) 16-bit with 49700Hz sample rate.

#### player.play(buffer)

* ```buffer``` &lt;Buffer&gt; | &lt;ArrayBuffer&gt; Source buffer

Start or continue playing source buffer in realtime. Only available if AudioContext is supported.

#### player.pause()

Pause realtime audio playback.

#### player.seek(ms)

* ```ms``` &lt;number&gt; milliseconds

Seek realtime audio playback to position in milliseconds.

#### player.position &lt;number&gt;

Get position of realtime audio playback in milliseconds.

#### player.length &lt;number&gt;

Get length of realtime audio in milliseconds. Starts at zero and growing to full length while processing source buffer in background ```WebWorker```.

#### player.volume &lt;number&gt;

Get or set audio volume, from ```0``` to ```Infinity```

#### Event: 'progress'

* &lt;number&gt;

The ```'progress'``` event is emitted on audio processing and returns the current position of the audio processing in percentage (from 0 to 100).

#### Event: 'midi'

* &lt;ArrayBuffer&gt;

The ```'midi'``` event is emitted only if the format handler supports MIDI conversion. Emitted only once after audio is fully processed. Returns MIDI file buffer as an ```ArrayBuffer```.

#### Event: 'normalization'

* &lt;number&gt;

The ```'normalization'``` event is emitted on audio normalization (if enabled) and returns the current current position of the normalization in percentage (from 0 to 100).

#### Event: 'gain'

* &lt;number&gt;

The ```'gain'``` event is emitted after normalization and returns the scale of normalization.

#### Event: 'position'

* &lt;number&gt;

Emitted on realtime audio playback, returns audio playback position in milliseconds (same as ```player.position```). 

## Class: ConvertTo32Bit

```ConvertTo32Bit``` is a ```Transform``` stream class, use this to convert 16-bit PCM audio data to 32-bit.

## Class: Normalizer

```Normalizer``` is a ```Transform``` stream class, use this to normalize PCM audio data. Used internally in ```Player``` class.

## WAV(data[, options])

See more details [here](https://github.com/doomjs/wav-arraybuffer).
Use this function to generate WAV audio format buffer from PCM audio data.

## Supported format types

* LAA: LucasArts music
* MUS: Doom music
* DRO: DosBox RAW OPL
* IMF: Id Music Format
* RAW: Rdos Raw OPL Capture

#### MUS format GENMIDI instruments support

The OPL3 library includes GENMIDI lump from shareware Doom as the default instrument set. You can override this in the CLI tool and in the ```Player``` class as well.

Use ```opl3 doom2/*.mus --genmidi DOOM2.OP2``` to inject the ```DOOM2.OP2``` GENMIDI lump file into the MUS format handler.

From JavaScript:

```javascript
new OPL3.Player(OPL3.format.MUS, {
    instruments: genmidi // ArrayBuffer or JSON
});
```

## Supported audio export formats

* WAV: PCM audio WAVE
* MP3: using [node-lame](https://github.com/TooTallNate/node-lame)
* OGG: using [node-vorbis](https://github.com/TooTallNate/node-vorbis) and [node-ogg](https://github.com/TooTallNate/node-ogg)
* MIDI: currently only supported by MUS file format handler
* Audio playback: using [node-speaker](https://github.com/TooTallNate/node-speaker) in node.js and Web Audio API in browser.

MP3, OGG and audio playback support are based on optional dependencies. If a dependency install has failed, the export format won't be available.

## PCM audio normalization

By default the command line utility uses _peak normalization_ on the PCM audio result buffer. To turn off this feature, please use ```-n0``` argument.

To enable normalization in the _Player_ class, instantiate the player like:

```javascript
var player = new Player(LAA, { normalization: true });
```

## Special thanks to

* Robson Cozendey, for creating ```That Vintage Tone``` OPL3 emulator
* Paul Radek, for creating the ```MUS``` format
* Vladimir Arnost, for creating ```MUSLib```
* Nathan Rajlich, for creating the ```MP3```, ```OGG```, ```Vorbis``` and ```Speaker``` node.js modules