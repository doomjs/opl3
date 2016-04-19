module.exports = {
    OPL3: require('./opl3'),
    format: {
        LAA: require('./format/laa'),
        MUS: require('./format/mus')
    },
    WAV: require('./wav').WAV,
    Player: function Player(format, options){
        this.load = function(buffer, callback, postMessage){
            try{
                postMessage = postMessage || function(){};
                
                var WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
                var writer = new WritableStreamBuffer({
                    initialSize: (1024 * 1024),
                    incrementAmount: (512 * 1024)
                });
                
                var player = new format(new module.exports.OPL3(2), options);
                player.load(buffer);
                
                var len = 0;
                var dlen = 0;
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
                }
                
                writer.end();

                postMessage({ cmd: 'end' });
                postMessage({ cmd: 'progress', value: 100 });
                if (typeof callback == 'function') callback(null, writer.getContents());
            }catch(err){
                console.error(err);
                if (typeof callback == 'function') callback(err, null);
            }
        };
    }
};