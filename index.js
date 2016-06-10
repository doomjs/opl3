module.exports = {
    OPL3: require('./opl3'),
    format: {
        LAA: require('./format/laa'),
        MUS: require('./format/mus'),
        DRO: require('./format/dro'),
        IMF: require('./format/imf')
    },
    WAV: require('./wav').WAV,
    Player: function Player(format, options){
        options = options || {};
        this.load = function(buffer, callback, postMessage){
            try{
                postMessage = postMessage || function(){};
                
                var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
                var writer = new WritableStreamBuffer({
                    initialSize: (1024 * 1024),
                    incrementAmount: (512 * 1024)
                });
                
                var player = new format(new module.exports.OPL3(), options);
                player.load(buffer);
                
                var len = 0;
                var dlen = 0;
                var fn = function(){
                    var start = Date.now();
                    while (player.update()){
                        var d = player.refresh();
                        var n = 4 * ((49700 * d) | 0);

                        len += n;
                        dlen += d;

                        postMessage({ cmd: 'position', samples: len, duration: dlen });
                        postMessage({ cmd: 'progress', value: Math.floor(player.position / player.data.byteLength * 1000) / 10 });

                        var arr = new Int16Array((n / 2) | 0);
                        for (var i = 0, j = 0; i < n; i += 4, j += 2){
                            arr.set(player.opl.read(), j);
                        }

                        var buf = new Buffer(arr.buffer);
                        writer.write(buf);
                        
                        if (Date.now() - start > 100) return setImmediate(fn);
                    }
                    
                    writer.end();
                    
                    var pcmBuffer = writer.getContents();
                    
                    if (options.normalization){
                        var peak = 0;
                        var targetPeak = 32768;
                        for (var i = 0; i < pcmBuffer.length; i += 2){
                            var p = Math.abs(dv.getInt16(i, true));
                            if (p > peak) peak = p;
                        }
                        var scale = targetPeak / peak;
                        for (var i = 0; i < pcmBuffer.length; i += 2){
                            dv.setInt16(i, Math.round(dv.getInt16(i, true) * scale), true);
                        }
                    }

                    postMessage({ cmd: 'end' });
                    postMessage({ cmd: 'progress', value: 100 });
                    if (typeof callback == 'function') callback(null, pcmBuffer);
                };
                
                fn();
            }catch(err){
                console.error(err);
                if (typeof callback == 'function') callback(err, null);
            }
        };
    }
};