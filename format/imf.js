var extend = require('extend');

function IMF(opl){
    this.opl = opl;
}
module.exports = IMF;

extend(IMF.prototype, {
    load: function(buffer){
        this.data = new DataView(buffer.buffer);
        this.size = this.data.getUint16(0, true);
        
        if (!this.size){
            this.type = 0;
            this.position = 0;
            this.size = this.data.byteLength;
        }else{
            this.type = 1;
            this.position = 2;
        }
    },
    update: function(){
        this.delay = 0;
        while (!this.delay && this.position < this.size){
            try{
                var reg = this.data.getUint8(this.position++);
                var value = this.data.getUint8(this.position++);
                this.delay = this.data.getUint16(this.position, true);
                this.position += 2;
                
                this.midi_write_adlib(reg, value);
                if (this.delay) return true;
            }catch(err){
                break;
            }
        }
        
        return false;
    },
    rewind: function(){
        this.position = 0;
    },
    refresh: function(){
        return this.delay / 700;
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