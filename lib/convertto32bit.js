var Transform = require('stream').Transform;
var util = require('util');

function ConvertTo32Bit(){
    Transform.call(this);
}

ConvertTo32Bit.prototype._transform = function(chunk, encoding, done){
    var b32 = new Float32Array(chunk.byteLength / 2);
    var dv = new DataView(chunk.buffer);
    for (var i = 0, offset = 0; offset < chunk.byteLength; i++, offset += 2){
        b32[i] = dv.getInt16(offset, true) / 32768;
    }
    done(null, new Buffer(b32.buffer));
};

util.inherits(ConvertTo32Bit, Transform);
module.exports = ConvertTo32Bit;