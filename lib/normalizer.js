var Transform = require('stream').Transform;
var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
var util = require('util');

function Normalizer(bitDepth){
    Transform.call(this);
    var self = this;

    var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
    var writer = new WritableStreamBuffer({
        initialSize: (1024 * 1024),
        incrementAmount: (512 * 1024)
    });

    var peak = 0;
    var scale = 1;
    var targetPeak = (bitDepth == 32 ? 1 : 32768);
    var len = 0;

    var bps = (bitDepth == 32 ? 4 : 2);
    var getter = (bitDepth == 32 ? DataView.prototype.getFloat32 : DataView.prototype.getInt16);
    var setter = (bitDepth == 32 ? DataView.prototype.setFloat32 : DataView.prototype.setInt16);

    this._transform = function(chunk, encoding, done){
        var dv = new DataView(chunk.buffer);
        len += chunk.byteLength / bps;

        for (var i = 0; i < chunk.byteLength; i += bps){
            var p = Math.abs(getter.call(dv, i, true));
            if (p > peak) peak = p;
        }

        writer.write(chunk);
        done();
    };

    this._flush = function(done){
        writer.end();
        var pcmBuffer = writer.getContents();

        var endFn = function(){
            self.push(pcmBuffer);
            done();
        };

        if (peak > 0){
            scale = targetPeak / peak;
            var dv = new DataView(pcmBuffer.buffer);

            var i = 0;
            var perc = 0;
            var normPcm = function(){
                var t = Date.now();

                for (; i < pcmBuffer.byteLength; i += bps){
                    setter.call(dv, i, Math.round(getter.call(dv, i, true) * scale), true);
                    var p = Math.floor((i / pcmBuffer.byteLength) * 1000) / 10;
                    if (p > perc){
                        perc = p;
                        self.emit('normalization', perc);
                    }
                    if (Date.now() - t > 1000) return setImmediate(normPcm);
                }

                self.emit('normalization', 100);
                self.emit('gain', scale);
                endFn();
            };
            normPcm();
        }else endFn();
    };
}

util.inherits(Normalizer, Transform);
module.exports = Normalizer;