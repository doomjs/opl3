var Readable = require('stream').Readable;
var util = require('util');
var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
require('setimmediate');

var OPL3 = require('./opl3');
var Normalizer = require('./normalizer');
var ConvertTo32Bit = require('./convertto32bit');

var currentScriptSrc = null;
try{
    currentScriptSrc = document.currentScript.src;
}catch(err){}

function Player(format, options){
    Readable.call(this);
    options = options || {};
    var self = this;

    var initNormalizer = function(){
        if (options.normalization){
            self.normalizer = new Normalizer(options.bitDepth || 16);
            self.pipe(self.normalizer);

            self.normalizer.on('normalization', function(value){
                self.emit('normalization', value);
            });
            self.normalizer.on('gain', function(value){
                self.emit('gain', value);
            });
            self.normalizer.on('error', function(err){
                self.emit('error', err);
            });
        }
    };

    var initPostMessage = function(postMessage){
        if (typeof postMessage == 'function'){
            self.on('end', function(){
                postMessage({ cmd: 'end' });
            });
            self.on('progress', function(value){
                postMessage({ cmd: 'progress', value: value });
            });
            self.on('error', function(err){
                throw err;
            });
            self.on('midi', function(midi){
                postMessage({ cmd: 'midi', value: midi }, [midi]);
            });

            if (options.normalization){
                self.normalizer.on('normalization', function(value){
                    postMessage({ cmd: 'normalization', value: value });
                });
                self.normalizer.on('gain', function(value){
                    postMessage({ cmd: 'gain', value: value });
                });
                self.normalizer.on('data', function(chunk){
                    postMessage({ cmd: 'data', value: chunk.buffer }, [chunk.buffer]);
                });
            }else{
                self.on('data', function(chunk){
                    postMessage({ cmd: 'data', value: chunk.buffer }, [chunk.buffer]);
                });
            }
        }
    };
    var load = function(buffer, callback, postMessage){
        return new Promise(function(resolve, reject){
            try{
                var bufferWriter = new WritableStreamBuffer({
                    initialSize: (1024 * 1024),
                    incrementAmount: (512 * 1024)
                });

                var onEnd = function(){
                    var pcmBuffer = bufferWriter.getContents().buffer;
                    if (typeof callback == 'function') callback(null, pcmBuffer);
                    resolve(pcmBuffer);
                    options.prebuffer = -1;
                };
                
                if (options.normalization){
                    self.normalizer.pipe(bufferWriter);
                    self.normalizer.on('end', onEnd);
                }else{
                    self.pipe(bufferWriter);
                    self.on('end', onEnd);
                }

                self.on('error', reject);

                if (buffer instanceof ArrayBuffer) buffer = new Buffer(buffer);
                initPostMessage(postMessage);
                
                var player = new format(new OPL3(), options);
                player.load(buffer);

                var aborted = false;
                self.abort = function(){
                    self.emit('abort');
                    aborted = true;
                };
                
                var len = 0;
                var dlen = 0;
                var samplesBuffer = null;
                var bufferType = options.bitDepth == 32 ? Float32Array : Int16Array;
                if (options.bufferSize){
                    samplesBuffer = new bufferType(options.bufferSize * 2);
                }
                var sampleRate = 49700 * ((options.sampleRate || 49700) / 49700);
                var fn = function(){
                    if (aborted) return;

                    var start = Date.now();
                    while (player.update()){
                        if (aborted) return;

                        var d = player.refresh();
                        var n = 4 * ((sampleRate * d) | 0);

                        len += n;
                        dlen += d;

                        self.emit('progress', Math.floor(player.position / player.data.byteLength * 1000) / 10);

                        var chunkSize = (n / 2) | 0;
                        if (options.bufferSize){
                            while(chunkSize > 0){
                                samplesSize = Math.min(options.bufferSize * 2, chunkSize);
                                chunkSize -= samplesSize;

                                player.opl.read(samplesBuffer);

                                self.emit('data', new Buffer(samplesBuffer.buffer));
                                samplesBuffer = new bufferType(options.bufferSize * 2);
                            }
                        }else{
                            var buffer = new bufferType(chunkSize);
                            player.opl.read(buffer);
                            self.emit('data', new Buffer(buffer.buffer));
                        }
                        
                        if (Date.now() - start > 1000) return setImmediate(fn);
                    }

                    self.emit('progress', 100);
                    if (player.midiBuffer) self.emit('midi', new Buffer(player.midiBuffer, 'binary').buffer);
                    self.emit('end');
                };
                
                fn();
            }catch(err){
                self.emit('error', err);
                if (typeof callback == 'function') callback(err, null);
                reject(err);
            }
        });
    };
 
    options.prebuffer = options.prebuffer || 200;
    if (typeof AudioContext != 'undefined'){
        var context = new AudioContext();
        var source = context.createBufferSource();
        var processor = context.createScriptProcessor(2048, 0, 2);
        var gain = context.createGain();
        gain.gain.value = options.volume || 1;
        var queue = [];

        var bufferLeft, bufferRight, silence, queuePos, bufferPerMs;
        var audioQueueFn = function(e){
            var outputBuffer = e.outputBuffer;

            if (self.length >= options.prebuffer){
                for (var i = 0; i < processor.bufferSize / options.bufferSize; i++){
                    var tmp = queue[queuePos];
                    if (tmp){
                        queuePos++;
                        self.emit('position', self.position);
                        var dv = new DataView(tmp.buffer || tmp);
                        for (var j = 0, offset = 0; j < options.bufferSize; j++, offset += 8){
                            bufferLeft[j] = dv.getFloat32(offset, true);
                            bufferRight[j] = dv.getFloat32(offset + 4, true);
                        }
                    }else{
                        bufferLeft.set(silence);
                        bufferRight.set(silence);
                    }

                    outputBuffer.copyToChannel(bufferLeft, 0, i * options.bufferSize);
                    outputBuffer.copyToChannel(bufferRight, 1, i * options.bufferSize);
                }
            }
        };
        var backupQueue = null;

        var isPlayInit = false;
        this.play = function(buffer){
            if (!isPlayInit){
                options.bufferSize = options.bufferSize || 64;
                options.sampleRate = context.sampleRate;
                options.bitDepth = 32;

                bufferLeft = new Float32Array(options.bufferSize);
                bufferRight = new Float32Array(options.bufferSize);
                silence = new Float32Array(options.bufferSize);
                queuePos = 0;

                bufferPerMs = (options.sampleRate / 1000) / options.bufferSize;

                self.load(buffer);
                self.on('data', function(buffer){
                    if (backupQueue) backupQueue.push(buffer);
                    else queue.push(buffer);
                });

                processor.onaudioprocess = audioQueueFn;
                source.connect(processor);
                processor.connect(gain);
                gain.connect(context.destination);
                source.start();

                isPlayInit = true;
            }

            if (backupQueue){
                queue = backupQueue;
                backupQueue = null;
            }
        };
        this.pause = function(){
            backupQueue = queue;
            queue = [];
        };
        this.on('abort', this.pause);

        this.seek = function(ms){
            queuePos = Math.floor(ms * bufferPerMs);
        };
        Object.defineProperty(this, 'position', {
            get: function(){ return Math.floor(queuePos / bufferPerMs); }
        });
        Object.defineProperty(this, 'length', {
            get: function(){ return Math.floor((backupQueue || queue).length / bufferPerMs); }
        });
        Object.defineProperty(this, 'volume', {
            get: function(){ return gain.gain.value; },
            set: function(value){ gain.gain.value = value; }
        });
    }

    if (!options.disableWorker && process.browser && typeof window != 'undefined' && 'Worker' in window){
        try{
            var self = this;
            this.load = function(buffer, callback, postMessage){
                initPostMessage(postMessage);

                var formatName = format.name;
                var workerSrc = [
                    'importScripts("' + currentScriptSrc + '");',
                    'onmessage = function(msg){',
                    '   var player = new OPL3.Player(OPL3.format.' + formatName + ', msg.data.options);',
                    '   player.load(msg.data.buffer, function(err, buffer){',
                    '       if (err) throw err;',
                    '       postMessage({ cmd: "callback", value: buffer }, [buffer]);',
                    '   }, postMessage);',
                    '};'
                ].join('\n');

                var blob;
                try{
                    blob = new Blob([workerSrc], {type: 'application/javascript'});
                }catch (e) { // Backwards-compatibility
                    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                    blob = new BlobBuilder();
                    blob.append(workerSrc);
                    blob = blob.getBlob();
                }
                var worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = function(msg){
                    self.emit(msg.data.cmd, msg.data.value);
                    if (msg.data.cmd == 'callback'){
                        if (typeof callback == 'function') callback(null, msg.data.value);
                        worker.terminate();
                    }
                };
                worker.onerror = function(err){
                    self.emit('error', err);
                    if (typeof callback == 'function') callback(err, null);
                };
                self.abort = function(){
                    worker.terminate();
                    self.emit('abort');
                };

                worker.postMessage({ buffer: buffer, options: options }, [buffer]);
            };
        }catch(err){
            console.warn('OPL3 WebWorker not supported! :(');
            options.prebuffer = Infinity;
            initNormalizer();
            this.load = load;
        }
    }else{
        options.prebuffer = Infinity;
        initNormalizer();
        this.load = load;
    }

    this._read = function(){};
}

util.inherits(Player, Readable);
module.exports = Player;