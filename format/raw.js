var extend = require('extend');

function RAW(opl){
    this.opl = opl;
}
module.exports = RAW;

extend(RAW.prototype, {
    load: function(buffer){
        var header = new Buffer(buffer.buffer).slice(0, 8).toString();
        if (header != 'RAWADATA') throw new Error('Buffer is not a "Rdos Raw OPL Capture" file');
        
        this.data = new DataView(buffer.buffer);
        this.clock = this.data.getUint16(8, true);
        
        this.rewind();
    },
    update: function(){
        this.delay = 0;
        while (!this.songend && !this.delay && this.position < this.data.byteLength){
            var value = this.data.getUint8(this.position++);
            var reg = this.data.getUint8(this.position++);
            
            switch (reg){
                case 0xff:
                    if (value == 0xff) this.songend = true;
                    break;
                case 0x00:
                    this.delay = value || 0xff;
                    break;
                case 0x02:
                    switch (value){
                        case 0x00:
                            this.clock = this.data.getUint16(this.position, true);
                            this.position += 2;
                            break;
                        case 0x01: this.bank = 0; break;
                        case 0x02: this.bank = 1; break;
                    }
                    break;
                default:
                    this.midi_write_adlib(reg, value);
            }
        }
        
        return !this.songend && this.delay;
    },
    rewind: function(){
        this.songend = false;
        this.delay = 0;
        this.position = 10;
        this.bank = 0;
        this.opl.write(0x01, 0x20);
    },
    refresh: function(){
        return this.delay / (1193180 / (this.clock || 0xffff));
    },
    midi_write_adlib: function(r, v){
        this.opl.write(this.bank, r, v);
    }
});