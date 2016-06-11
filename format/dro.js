var extend = require('extend');

function DRO(opl){
    this.opl = opl;
}
module.exports = DRO;

extend(DRO.prototype, {
    hardwareType: ['OPL2', 'Dual OPL2', 'OPL3'],
    load: function(buffer){
        var header = new Buffer(buffer.buffer).slice(0, 8).toString();
        if (header != 'DBRAWOPL') throw new Error('Buffer is not a "DOSBox Raw OPL" file');
        
        var buffer = this.data = new DataView(buffer.buffer);
        this.version = 'v' + buffer.getUint16(8, true) + '.' + buffer.getUint16(10, true);
        this.size = buffer.getUint32(12, true);
        this.length = buffer.getUint32(16, true);
        this.hardware = this.hardwareType[buffer.getUint8(20)];
        this.dataFormat = buffer.getUint8(21);
        this.compression = buffer.getUint8(22);
        this.shortDelay = buffer.getUint8(23);
        this.longDelay = buffer.getUint8(24);
        this.codemapSize = buffer.getUint8(25);
        
        this.position = 26;
        this.codemap = [];
        for (var i = 0; i < this.codemapSize; i++){
            this.codemap[i] = buffer.getUint8(this.position++);
        }
        
        this.start = this.position;
    },
    update: function(){
        this.delay = 0;
        while (!this.delay && this.position < this.data.byteLength){
            var index = this.data.getUint8(this.position);
            var reg = this.codemap[index];
            if (index & 0x80){
                reg = 0x100 + this.codemap[index & 0x7f];
            }
            
            if (this.position + 1 >= this.data.byteLength){
                return false;
            }
            
            var value = this.data.getUint8(this.position + 1);
            this.position += 2;
            
            if (index == this.shortDelay){
                this.delay = value + 1;
                return true;
            }else if (index == this.longDelay){
                this.delay = (value + 1) << 8;
                return true;
            }else if (typeof reg == 'number'){
                this.midi_write_adlib(reg, value);
            }else throw Error('Unknown index: ' + index);
        }
        
        return false;
    },
    rewind: function(){
        this.position = this.start;
    },
    refresh: function(){
        return this.delay / 8 * 1 / 120;
    },
    midi_write_adlib: function(r, v){
        var a = 0;
        if (r >= 0x100){
            a = 1;
            r -= 0x100;
        }
        
        this.opl.write(a, r, v);
    }
});