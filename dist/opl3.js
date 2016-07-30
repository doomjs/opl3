(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OPL3 = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (Buffer){
var extend = _dereq_('extend');

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
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":13,"extend":18}],2:[function(_dereq_,module,exports){
module.exports={
    "header": "#OPL_II#",
    "instruments": [
        {
            "name": "Acoustic Grand Piano",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 240,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 20,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 241,
                    "carrierSustain": 244,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Bright Acoustic Piano",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 240,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 18,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 241,
                    "carrierSustain": 244,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Grand Piano",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 225,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 14,
                    "feedback": 8,
                    "carrierTremolo": 48,
                    "carrierAttack": 241,
                    "carrierSustain": 244,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 17,
                    "modulatorAttack": 232,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 1,
                    "carrierTremolo": 18,
                    "carrierAttack": 247,
                    "carrierSustain": 20,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Honky-tonk Piano",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 130,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 241,
                    "modulatorSustain": 83,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 6,
                    "carrierTremolo": 16,
                    "carrierAttack": 209,
                    "carrierSustain": 244,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 17,
                    "modulatorAttack": 241,
                    "modulatorSustain": 83,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 6,
                    "carrierTremolo": 17,
                    "carrierAttack": 209,
                    "carrierSustain": 244,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Rhodes Paino",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 33,
                    "modulatorAttack": 241,
                    "modulatorSustain": 81,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 38,
                    "feedback": 6,
                    "carrierTremolo": 49,
                    "carrierAttack": 210,
                    "carrierSustain": 229,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Chorused Piano",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 241,
                    "modulatorSustain": 230,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 17,
                    "feedback": 6,
                    "carrierTremolo": 176,
                    "carrierAttack": 241,
                    "carrierSustain": 229,
                    "carrierWaveform": 0,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 18,
                    "modulatorAttack": 242,
                    "modulatorSustain": 121,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 3,
                    "feedback": 9,
                    "carrierTremolo": 16,
                    "carrierAttack": 241,
                    "carrierSustain": 153,
                    "carrierWaveform": 0,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Harpsichord",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 242,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 7,
                    "feedback": 6,
                    "carrierTremolo": 48,
                    "carrierAttack": 193,
                    "carrierSustain": 244,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Clavinet",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 144,
                    "modulatorAttack": 161,
                    "modulatorSustain": 98,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 14,
                    "feedback": 12,
                    "carrierTremolo": 16,
                    "carrierAttack": 145,
                    "carrierSustain": 167,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Celesta",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 40,
                    "modulatorAttack": 242,
                    "modulatorSustain": 100,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 8,
                    "carrierTremolo": 49,
                    "carrierAttack": 242,
                    "carrierSustain": 228,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Glockenspiel",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 145,
                    "modulatorSustain": 17,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 14,
                    "feedback": 9,
                    "carrierTremolo": 20,
                    "carrierAttack": 125,
                    "carrierSustain": 52,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Music Box",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 178,
                    "modulatorAttack": 246,
                    "modulatorSustain": 65,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 15,
                    "feedback": 0,
                    "carrierTremolo": 144,
                    "carrierAttack": 210,
                    "carrierSustain": 146,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Vibraphone",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 241,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 2,
                    "feedback": 1,
                    "carrierTremolo": 242,
                    "carrierAttack": 241,
                    "carrierSustain": 244,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Marimba",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 128,
                    "modulatorAttack": 121,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 1,
                    "carrierTremolo": 131,
                    "carrierAttack": 248,
                    "carrierSustain": 117,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Xylophone",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 20,
                    "modulatorAttack": 246,
                    "modulatorSustain": 147,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 31,
                    "feedback": 8,
                    "carrierTremolo": 16,
                    "carrierAttack": 246,
                    "carrierSustain": 83,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Tubular-bell",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 129,
                    "modulatorAttack": 182,
                    "modulatorSustain": 19,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 25,
                    "feedback": 10,
                    "carrierTremolo": 2,
                    "carrierAttack": 255,
                    "carrierSustain": 19,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Dulcimer",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 145,
                    "modulatorSustain": 17,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 7,
                    "feedback": 8,
                    "carrierTremolo": 17,
                    "carrierAttack": 82,
                    "carrierSustain": 83,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Hammond Organ",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 177,
                    "modulatorSustain": 22,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 8,
                    "feedback": 7,
                    "carrierTremolo": 97,
                    "carrierAttack": 209,
                    "carrierSustain": 23,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Percussive Organ",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 241,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 7,
                    "carrierTremolo": 148,
                    "carrierAttack": 244,
                    "carrierSustain": 54,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Rock Organ",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 138,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 226,
                    "modulatorAttack": 242,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 30,
                    "feedback": 0,
                    "carrierTremolo": 96,
                    "carrierAttack": 255,
                    "carrierSustain": 7,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 242,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 30,
                    "feedback": 0,
                    "carrierTremolo": 160,
                    "carrierAttack": 255,
                    "carrierSustain": 7,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Church Organ",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 48,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 9,
                    "carrierTremolo": 49,
                    "carrierAttack": 84,
                    "carrierSustain": 20,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 49,
                    "modulatorAttack": 84,
                    "modulatorSustain": 20,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 9,
                    "carrierTremolo": 48,
                    "carrierAttack": 253,
                    "carrierSustain": 68,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Reed Organ",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 128,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 9,
                    "feedback": 6,
                    "carrierTremolo": 129,
                    "carrierAttack": 96,
                    "carrierSustain": 23,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Accordion",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 125,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 162,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 8,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 65,
                    "carrierSustain": 38,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 130,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 10,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 70,
                    "carrierSustain": 38,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Harmonica",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 96,
                    "modulatorSustain": 52,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 12,
                    "feedback": 8,
                    "carrierTremolo": 178,
                    "carrierAttack": 66,
                    "carrierSustain": 22,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 96,
                    "modulatorSustain": 52,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 12,
                    "feedback": 8,
                    "carrierTremolo": 178,
                    "carrierAttack": 66,
                    "carrierSustain": 22,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 12
                }
            ]
        },
        {
            "name": "Tango Accordion",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 129,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 240,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 8,
                    "carrierTremolo": 49,
                    "carrierAttack": 82,
                    "carrierSustain": 5,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 240,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 49,
                    "carrierAttack": 82,
                    "carrierSustain": 5,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Guitar (nylon)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 241,
                    "modulatorSustain": 245,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 13,
                    "feedback": 0,
                    "carrierTremolo": 32,
                    "carrierAttack": 241,
                    "carrierSustain": 246,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Guitar (steel)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 225,
                    "modulatorSustain": 228,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 13,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 242,
                    "carrierSustain": 227,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Guitar (jazz)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 241,
                    "modulatorSustain": 31,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 33,
                    "feedback": 10,
                    "carrierTremolo": 0,
                    "carrierAttack": 244,
                    "carrierSustain": 136,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Electric Guitar (clean)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 234,
                    "modulatorSustain": 50,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 7,
                    "feedback": 2,
                    "carrierTremolo": 16,
                    "carrierAttack": 210,
                    "carrierSustain": 231,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Guitar (muted)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 224,
                    "modulatorSustain": 244,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 48,
                    "carrierAttack": 242,
                    "carrierSustain": 245,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Overdriven Guitar",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 241,
                    "modulatorSustain": 255,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 6,
                    "feedback": 2,
                    "carrierTremolo": 81,
                    "carrierAttack": 240,
                    "carrierSustain": 255,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 0,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 0,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Distortion Guitar",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 241,
                    "modulatorSustain": 255,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 13,
                    "feedback": 12,
                    "carrierTremolo": 81,
                    "carrierAttack": 240,
                    "carrierSustain": 255,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 0,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 0,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Guitar Harmonics",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 161,
                    "modulatorSustain": 151,
                    "modulatorWaveform": 2,
                    "modulatorKey": 64,
                    "modulatorOutput": 3,
                    "feedback": 0,
                    "carrierTremolo": 17,
                    "carrierAttack": 225,
                    "carrierSustain": 231,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Bass",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 33,
                    "modulatorAttack": 148,
                    "modulatorSustain": 6,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 14,
                    "feedback": 2,
                    "carrierTremolo": 162,
                    "carrierAttack": 195,
                    "carrierSustain": 166,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 0,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 0,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Bass (finger)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 240,
                    "modulatorSustain": 255,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 22,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 241,
                    "carrierSustain": 248,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Bass (pick)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 224,
                    "modulatorSustain": 20,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 8,
                    "carrierTremolo": 48,
                    "carrierAttack": 225,
                    "carrierSustain": 214,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Fretless Bass",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 96,
                    "modulatorSustain": 0,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 26,
                    "feedback": 8,
                    "carrierTremolo": 16,
                    "carrierAttack": 129,
                    "carrierSustain": 246,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Slap Bass 1",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 240,
                    "modulatorSustain": 231,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 49,
                    "carrierAttack": 241,
                    "carrierSustain": 71,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 245,
                    "modulatorSustain": 231,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 13,
                    "feedback": 13,
                    "carrierTremolo": 16,
                    "carrierAttack": 246,
                    "carrierSustain": 231,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Slap Bass 2",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 240,
                    "modulatorSustain": 229,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 16,
                    "feedback": 8,
                    "carrierTremolo": 49,
                    "carrierAttack": 241,
                    "carrierSustain": 245,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Bass 1",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 244,
                    "modulatorSustain": 245,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 10,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 243,
                    "carrierSustain": 246,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Bass 2",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 118,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 131,
                    "modulatorSustain": 70,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 21,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 210,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 131,
                    "modulatorSustain": 70,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 21,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 210,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Violin",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 96,
                    "modulatorAttack": 80,
                    "modulatorSustain": 69,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 23,
                    "feedback": 6,
                    "carrierTremolo": 161,
                    "carrierAttack": 97,
                    "carrierSustain": 70,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Viola",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 96,
                    "modulatorSustain": 68,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 2,
                    "carrierTremolo": 113,
                    "carrierAttack": 65,
                    "carrierSustain": 21,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Cello",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 208,
                    "modulatorSustain": 20,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 15,
                    "feedback": 6,
                    "carrierTremolo": 97,
                    "carrierAttack": 98,
                    "carrierSustain": 23,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Contrabass",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 177,
                    "modulatorSustain": 17,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 10,
                    "feedback": 6,
                    "carrierTremolo": 32,
                    "carrierAttack": 160,
                    "carrierSustain": 21,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Tremolo Strings",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 139,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 195,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 9,
                    "feedback": 6,
                    "carrierTremolo": 97,
                    "carrierAttack": 131,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 112,
                    "modulatorAttack": 179,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 9,
                    "feedback": 6,
                    "carrierTremolo": 96,
                    "carrierAttack": 147,
                    "carrierSustain": 5,
                    "carrierWaveform": 1,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pizzicato Strings",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 248,
                    "modulatorSustain": 249,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 23,
                    "feedback": 14,
                    "carrierTremolo": 32,
                    "carrierAttack": 118,
                    "carrierSustain": 230,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Orchestral Harp",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 49,
                    "modulatorAttack": 241,
                    "modulatorSustain": 53,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 36,
                    "feedback": 0,
                    "carrierTremolo": 32,
                    "carrierAttack": 243,
                    "carrierSustain": 179,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Timpani",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 170,
                    "modulatorSustain": 200,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 4,
                    "feedback": 10,
                    "carrierTremolo": 16,
                    "carrierAttack": 210,
                    "carrierSustain": 179,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "String Ensemble 1",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 120,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 96,
                    "modulatorAttack": 192,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 17,
                    "feedback": 4,
                    "carrierTremolo": 177,
                    "carrierAttack": 85,
                    "carrierSustain": 4,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 144,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 18,
                    "feedback": 6,
                    "carrierTremolo": 49,
                    "carrierAttack": 85,
                    "carrierSustain": 4,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "String Ensemble 2",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 133,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 144,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 17,
                    "feedback": 4,
                    "carrierTremolo": 161,
                    "carrierAttack": 53,
                    "carrierSustain": 5,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 144,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 18,
                    "feedback": 6,
                    "carrierTremolo": 33,
                    "carrierAttack": 53,
                    "carrierSustain": 5,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Strings 1",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 123,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 161,
                    "modulatorAttack": 105,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 19,
                    "feedback": 10,
                    "carrierTremolo": 241,
                    "carrierAttack": 102,
                    "carrierSustain": 2,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 161,
                    "modulatorAttack": 105,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 19,
                    "feedback": 10,
                    "carrierTremolo": 241,
                    "carrierAttack": 102,
                    "carrierSustain": 2,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                }
            ]
        },
        {
            "name": "Synth Strings 2",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 132,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 33,
                    "modulatorAttack": 17,
                    "modulatorSustain": 3,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 13,
                    "feedback": 0,
                    "carrierTremolo": 32,
                    "carrierAttack": 49,
                    "carrierSustain": 4,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 17,
                    "modulatorSustain": 51,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 2,
                    "feedback": 8,
                    "carrierTremolo": 0,
                    "carrierAttack": 49,
                    "carrierSustain": 54,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Choir Aahs",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 138,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 96,
                    "modulatorAttack": 144,
                    "modulatorSustain": 84,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 22,
                    "feedback": 0,
                    "carrierTremolo": 96,
                    "carrierAttack": 112,
                    "carrierSustain": 4,
                    "carrierWaveform": 0,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 144,
                    "modulatorSustain": 84,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 96,
                    "carrierAttack": 112,
                    "carrierSustain": 4,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Voice Oohs",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 177,
                    "modulatorSustain": 183,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 25,
                    "feedback": 0,
                    "carrierTremolo": 160,
                    "carrierAttack": 114,
                    "carrierSustain": 133,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 18,
                    "modulatorAttack": 102,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 6,
                    "feedback": 12,
                    "carrierTremolo": 81,
                    "carrierAttack": 174,
                    "carrierSustain": 182,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                }
            ]
        },
        {
            "name": "Synth Voice",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 96,
                    "modulatorSustain": 84,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 26,
                    "feedback": 0,
                    "carrierTremolo": 176,
                    "carrierAttack": 48,
                    "carrierSustain": 116,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Orchestra Hit",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 48,
                    "modulatorSustain": 67,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 16,
                    "feedback": 2,
                    "carrierTremolo": 16,
                    "carrierAttack": 100,
                    "carrierSustain": 20,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -24
                },
                {
                    "modulatorTremolo": 144,
                    "modulatorAttack": 80,
                    "modulatorSustain": 66,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 2,
                    "carrierTremolo": 17,
                    "carrierAttack": 84,
                    "carrierSustain": 69,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                }
            ]
        },
        {
            "name": "Trumpet",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 128,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 14,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 81,
                    "carrierSustain": 54,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Trombone",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 113,
                    "modulatorSustain": 31,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 26,
                    "feedback": 14,
                    "carrierTremolo": 32,
                    "carrierAttack": 114,
                    "carrierSustain": 59,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Tuba",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 80,
                    "modulatorSustain": 70,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 22,
                    "feedback": 12,
                    "carrierTremolo": 32,
                    "carrierAttack": 146,
                    "carrierSustain": 86,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Muted Trumpet",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 128,
                    "modulatorAttack": 128,
                    "modulatorSustain": 230,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 13,
                    "feedback": 12,
                    "carrierTremolo": 144,
                    "carrierAttack": 81,
                    "carrierSustain": 246,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "French Horn",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 129,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 112,
                    "modulatorSustain": 184,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 34,
                    "feedback": 14,
                    "carrierTremolo": 32,
                    "carrierAttack": 97,
                    "carrierSustain": 150,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 112,
                    "modulatorSustain": 184,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 35,
                    "feedback": 14,
                    "carrierTremolo": 32,
                    "carrierAttack": 97,
                    "carrierSustain": 150,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Brass Section",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 131,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 96,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 14,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 81,
                    "carrierSustain": 54,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 112,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 18,
                    "feedback": 14,
                    "carrierTremolo": 48,
                    "carrierAttack": 97,
                    "carrierSustain": 54,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Brass 1",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 134,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 145,
                    "modulatorSustain": 166,
                    "modulatorWaveform": 2,
                    "modulatorKey": 64,
                    "modulatorOutput": 13,
                    "feedback": 12,
                    "carrierTremolo": 32,
                    "carrierAttack": 129,
                    "carrierSustain": 151,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 145,
                    "modulatorSustain": 166,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 12,
                    "feedback": 12,
                    "carrierTremolo": 32,
                    "carrierAttack": 145,
                    "carrierSustain": 151,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Bass 2",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 134,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 129,
                    "modulatorSustain": 166,
                    "modulatorWaveform": 2,
                    "modulatorKey": 64,
                    "modulatorOutput": 16,
                    "feedback": 12,
                    "carrierTremolo": 48,
                    "carrierAttack": 97,
                    "carrierSustain": 151,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 129,
                    "modulatorSustain": 166,
                    "modulatorWaveform": 2,
                    "modulatorKey": 64,
                    "modulatorOutput": 10,
                    "feedback": 10,
                    "carrierTremolo": 48,
                    "carrierAttack": 97,
                    "carrierSustain": 151,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Soprano Sax",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 96,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 22,
                    "feedback": 6,
                    "carrierTremolo": 177,
                    "carrierAttack": 82,
                    "carrierSustain": 22,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Alto Sax",
            "data": {},
            "flags": 2,
            "fixedPitch": false,
            "unknown": true,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 112,
                    "modulatorSustain": 6,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 9,
                    "feedback": 6,
                    "carrierTremolo": 176,
                    "carrierAttack": 98,
                    "carrierSustain": 22,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Tenor Sax",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 152,
                    "modulatorSustain": 11,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 10,
                    "feedback": 10,
                    "carrierTremolo": 176,
                    "carrierAttack": 115,
                    "carrierSustain": 11,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Baritone Sax",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 144,
                    "modulatorSustain": 11,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 5,
                    "feedback": 10,
                    "carrierTremolo": 176,
                    "carrierAttack": 99,
                    "carrierSustain": 27,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Oboe",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 112,
                    "modulatorAttack": 112,
                    "modulatorSustain": 22,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 16,
                    "feedback": 6,
                    "carrierTremolo": 162,
                    "carrierAttack": 92,
                    "carrierSustain": 8,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "English Horn",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 200,
                    "modulatorSustain": 7,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 115,
                    "carrierSustain": 7,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Bassoon",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 144,
                    "modulatorSustain": 25,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 17,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 97,
                    "carrierSustain": 27,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Clarinet",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 165,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 13,
                    "feedback": 8,
                    "carrierTremolo": 176,
                    "carrierAttack": 99,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Piccolo",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 110,
                    "modulatorSustain": 143,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 112,
                    "carrierAttack": 53,
                    "carrierSustain": 42,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Flute",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 80,
                    "modulatorSustain": 136,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 19,
                    "feedback": 8,
                    "carrierTremolo": 96,
                    "carrierAttack": 85,
                    "carrierSustain": 42,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Recorder",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 101,
                    "modulatorSustain": 23,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 10,
                    "feedback": 11,
                    "carrierTremolo": 160,
                    "carrierAttack": 116,
                    "carrierSustain": 39,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pan Flute",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 36,
                    "modulatorSustain": 39,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 4,
                    "feedback": 9,
                    "carrierTremolo": 176,
                    "carrierAttack": 69,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 23,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 0,
                    "carrierAttack": 37,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Bottle Blow",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 225,
                    "modulatorAttack": 87,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 45,
                    "feedback": 14,
                    "carrierTremolo": 96,
                    "carrierAttack": 87,
                    "carrierSustain": 55,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Shakuhachi",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 241,
                    "modulatorAttack": 87,
                    "modulatorSustain": 52,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 40,
                    "feedback": 14,
                    "carrierTremolo": 225,
                    "carrierAttack": 103,
                    "carrierSustain": 93,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Whistle",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 208,
                    "modulatorAttack": 49,
                    "modulatorSustain": 15,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 7,
                    "feedback": 11,
                    "carrierTremolo": 112,
                    "carrierAttack": 50,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Ocarina",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 176,
                    "modulatorAttack": 81,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 7,
                    "feedback": 11,
                    "carrierTremolo": 48,
                    "carrierAttack": 66,
                    "carrierSustain": 41,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 1 (square)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 130,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 34,
                    "modulatorAttack": 81,
                    "modulatorSustain": 91,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 48,
                    "carrierAttack": 96,
                    "carrierSustain": 37,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 34,
                    "modulatorAttack": 145,
                    "modulatorSustain": 91,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 13,
                    "feedback": 0,
                    "carrierTremolo": 48,
                    "carrierAttack": 240,
                    "carrierSustain": 37,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 2 (sawtooth)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 127,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 193,
                    "modulatorSustain": 155,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 3,
                    "feedback": 8,
                    "carrierTremolo": 49,
                    "carrierAttack": 192,
                    "carrierSustain": 101,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 96,
                    "modulatorAttack": 177,
                    "modulatorSustain": 171,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 1,
                    "feedback": 8,
                    "carrierTremolo": 49,
                    "carrierAttack": 241,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 3 (calliope)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 87,
                    "modulatorSustain": 51,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 40,
                    "feedback": 14,
                    "carrierTremolo": 224,
                    "carrierAttack": 103,
                    "carrierSustain": 7,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 4 (chiffer)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 130,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 87,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 35,
                    "feedback": 14,
                    "carrierTremolo": 224,
                    "carrierAttack": 103,
                    "carrierSustain": 77,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 247,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 35,
                    "feedback": 14,
                    "carrierTremolo": 224,
                    "carrierAttack": 135,
                    "carrierSustain": 77,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 5 (charang)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 161,
                    "modulatorAttack": 120,
                    "modulatorSustain": 11,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 2,
                    "feedback": 8,
                    "carrierTremolo": 48,
                    "carrierAttack": 241,
                    "carrierSustain": 43,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 6 (voice)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 122,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 96,
                    "modulatorAttack": 128,
                    "modulatorSustain": 85,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 33,
                    "feedback": 8,
                    "carrierTremolo": 224,
                    "carrierAttack": 242,
                    "carrierSustain": 20,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 144,
                    "modulatorSustain": 85,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 33,
                    "feedback": 8,
                    "carrierTremolo": 160,
                    "carrierAttack": 162,
                    "carrierSustain": 20,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Lead 7 (5th sawtooth)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 125,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 193,
                    "modulatorSustain": 149,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 3,
                    "feedback": 10,
                    "carrierTremolo": 176,
                    "carrierAttack": 112,
                    "carrierSustain": 99,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 145,
                    "modulatorSustain": 149,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 9,
                    "feedback": 10,
                    "carrierTremolo": 49,
                    "carrierAttack": 97,
                    "carrierSustain": 99,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -5
                }
            ]
        },
        {
            "name": "Lead 8 (bass & lead)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 36,
                    "modulatorAttack": 81,
                    "modulatorSustain": 7,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 0,
                    "feedback": 9,
                    "carrierTremolo": 160,
                    "carrierAttack": 253,
                    "carrierSustain": 41,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* Lead 8 (bass & lead)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 36,
                    "modulatorAttack": 81,
                    "modulatorSustain": 7,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 0,
                    "feedback": 9,
                    "carrierTremolo": 160,
                    "carrierAttack": 253,
                    "carrierSustain": 41,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 2 (warm)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 130,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 128,
                    "modulatorAttack": 50,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 0,
                    "feedback": 9,
                    "carrierTremolo": 96,
                    "carrierAttack": 51,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 64,
                    "modulatorAttack": 50,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 0,
                    "feedback": 9,
                    "carrierTremolo": 224,
                    "carrierAttack": 51,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 3 (polysynth)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 130,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 161,
                    "modulatorSustain": 165,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 12,
                    "carrierTremolo": 160,
                    "carrierAttack": 161,
                    "carrierSustain": 150,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 160,
                    "modulatorAttack": 161,
                    "modulatorSustain": 165,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 12,
                    "carrierTremolo": 160,
                    "carrierAttack": 161,
                    "carrierSustain": 150,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 4 (choir)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 139,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 240,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 1,
                    "carrierTremolo": 96,
                    "carrierAttack": 129,
                    "carrierSustain": 84,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 240,
                    "modulatorSustain": 5,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 1,
                    "carrierTremolo": 96,
                    "carrierAttack": 113,
                    "carrierSustain": 84,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 5 (bowed glass)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 128,
                    "modulatorAttack": 161,
                    "modulatorSustain": 51,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 10,
                    "feedback": 7,
                    "carrierTremolo": 224,
                    "carrierAttack": 82,
                    "carrierSustain": 84,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 6 (metal)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 129,
                    "modulatorAttack": 128,
                    "modulatorSustain": 82,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 29,
                    "feedback": 14,
                    "carrierTremolo": 64,
                    "carrierAttack": 35,
                    "carrierSustain": 83,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 7 (halo)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 126,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 225,
                    "modulatorAttack": 81,
                    "modulatorSustain": 69,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 13,
                    "feedback": 0,
                    "carrierTremolo": 160,
                    "carrierAttack": 145,
                    "carrierSustain": 70,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 161,
                    "modulatorAttack": 81,
                    "modulatorSustain": 69,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 13,
                    "feedback": 0,
                    "carrierTremolo": 160,
                    "carrierAttack": 129,
                    "carrierSustain": 70,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pad 8 (sweep)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 225,
                    "modulatorAttack": 17,
                    "modulatorSustain": 82,
                    "modulatorWaveform": 1,
                    "modulatorKey": 128,
                    "modulatorOutput": 12,
                    "feedback": 8,
                    "carrierTremolo": 224,
                    "carrierAttack": 128,
                    "carrierSustain": 115,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 1 (rain)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 114,
                    "modulatorSustain": 71,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 0,
                    "feedback": 11,
                    "carrierTremolo": 131,
                    "carrierAttack": 248,
                    "carrierSustain": 25,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 2 (soundtrack)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 136,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 133,
                    "modulatorSustain": 2,
                    "modulatorWaveform": 1,
                    "modulatorKey": 192,
                    "modulatorOutput": 18,
                    "feedback": 10,
                    "carrierTremolo": 193,
                    "carrierAttack": 69,
                    "carrierSustain": 18,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 34,
                    "modulatorAttack": 69,
                    "modulatorSustain": 3,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 18,
                    "feedback": 10,
                    "carrierTremolo": 227,
                    "carrierAttack": 53,
                    "carrierSustain": 53,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -5
                }
            ]
        },
        {
            "name": "* FX 3 (crystal)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 4,
                    "modulatorAttack": 246,
                    "modulatorSustain": 116,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 2,
                    "carrierAttack": 163,
                    "carrierSustain": 36,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -24
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 4 (atmosphere)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 126,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 144,
                    "modulatorAttack": 192,
                    "modulatorSustain": 210,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 14,
                    "feedback": 0,
                    "carrierTremolo": 48,
                    "carrierAttack": 209,
                    "carrierSustain": 210,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 144,
                    "modulatorAttack": 208,
                    "modulatorSustain": 210,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 14,
                    "feedback": 0,
                    "carrierTremolo": 48,
                    "carrierAttack": 241,
                    "carrierSustain": 210,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 5 (brightness)",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 116,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 208,
                    "modulatorAttack": 144,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 192,
                    "carrierAttack": 194,
                    "carrierSustain": 243,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 208,
                    "modulatorAttack": 144,
                    "modulatorSustain": 243,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 18,
                    "feedback": 0,
                    "carrierTremolo": 192,
                    "carrierAttack": 194,
                    "carrierSustain": 242,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 6 (goblin)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 19,
                    "modulatorSustain": 82,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 26,
                    "feedback": 0,
                    "carrierTremolo": 241,
                    "carrierAttack": 51,
                    "carrierSustain": 19,
                    "carrierWaveform": 2,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "FX 7 (echo drops)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 224,
                    "modulatorAttack": 69,
                    "modulatorSustain": 186,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 26,
                    "feedback": 0,
                    "carrierTremolo": 240,
                    "carrierAttack": 50,
                    "carrierSustain": 145,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "* FX 8 (star-theme)",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 88,
                    "modulatorSustain": 2,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 24,
                    "feedback": 10,
                    "carrierTremolo": 2,
                    "carrierAttack": 66,
                    "carrierSustain": 114,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Sitar",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 99,
                    "modulatorSustain": 179,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 8,
                    "feedback": 2,
                    "carrierTremolo": 36,
                    "carrierAttack": 99,
                    "carrierSustain": 179,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Banjo",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 119,
                    "modulatorSustain": 18,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 13,
                    "feedback": 4,
                    "carrierTremolo": 16,
                    "carrierAttack": 243,
                    "carrierSustain": 244,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 250,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 10,
                    "feedback": 15,
                    "carrierTremolo": 0,
                    "carrierAttack": 249,
                    "carrierSustain": 250,
                    "carrierWaveform": 3,
                    "carrierKey": 64,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Shamisen",
            "data": {},
            "flags": 4,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 51,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 244,
                    "carrierSustain": 115,
                    "carrierWaveform": 2,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 7,
                    "modulatorAttack": 249,
                    "modulatorSustain": 172,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 26,
                    "feedback": 0,
                    "carrierTremolo": 15,
                    "carrierAttack": 249,
                    "carrierSustain": 41,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Koto",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 242,
                    "modulatorSustain": 83,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 33,
                    "feedback": 8,
                    "carrierTremolo": 34,
                    "carrierAttack": 145,
                    "carrierSustain": 228,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Kalimba",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 241,
                    "modulatorSustain": 57,
                    "modulatorWaveform": 3,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 6,
                    "carrierTremolo": 21,
                    "carrierAttack": 214,
                    "carrierSustain": 116,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Bag Pipe",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 137,
                    "modulatorSustain": 21,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 2,
                    "feedback": 10,
                    "carrierTremolo": 33,
                    "carrierAttack": 107,
                    "carrierSustain": 7,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Fiddle",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 161,
                    "modulatorSustain": 3,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 31,
                    "feedback": 14,
                    "carrierTremolo": 33,
                    "carrierAttack": 82,
                    "carrierSustain": 38,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Shanai",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 48,
                    "modulatorAttack": 64,
                    "modulatorSustain": 19,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 19,
                    "feedback": 8,
                    "carrierTremolo": 48,
                    "carrierAttack": 97,
                    "carrierSustain": 22,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Tinkle Bell",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 161,
                    "modulatorSustain": 50,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 1,
                    "carrierTremolo": 18,
                    "carrierAttack": 178,
                    "carrierSustain": 114,
                    "carrierWaveform": 1,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": -7
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Agogo",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 149,
                    "modulatorAttack": 231,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 1,
                    "feedback": 4,
                    "carrierTremolo": 22,
                    "carrierAttack": 150,
                    "carrierSustain": 103,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Steel Drums",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 240,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 9,
                    "feedback": 6,
                    "carrierTremolo": 32,
                    "carrierAttack": 130,
                    "carrierSustain": 5,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Woodblock",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 248,
                    "modulatorSustain": 209,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 6,
                    "carrierTremolo": 18,
                    "carrierAttack": 245,
                    "carrierSustain": 120,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Taiko Drum",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 16,
                    "modulatorAttack": 167,
                    "modulatorSustain": 236,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 11,
                    "feedback": 0,
                    "carrierTremolo": 16,
                    "carrierAttack": 213,
                    "carrierSustain": 245,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Melodic Tom",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 32,
                    "modulatorAttack": 168,
                    "modulatorSustain": 200,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 11,
                    "feedback": 0,
                    "carrierTremolo": 1,
                    "carrierAttack": 214,
                    "carrierSustain": 183,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Synth Drum",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 248,
                    "modulatorSustain": 196,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 11,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 211,
                    "carrierSustain": 183,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Reverse Cymbal",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 12,
                    "modulatorAttack": 65,
                    "modulatorSustain": 49,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 15,
                    "feedback": 14,
                    "carrierTremolo": 16,
                    "carrierAttack": 33,
                    "carrierSustain": 29,
                    "carrierWaveform": 3,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Guitar Fret Noise",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 50,
                    "modulatorAttack": 52,
                    "modulatorSustain": 179,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 33,
                    "feedback": 14,
                    "carrierTremolo": 49,
                    "carrierAttack": 84,
                    "carrierSustain": 247,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Breath Noise",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 209,
                    "modulatorAttack": 55,
                    "modulatorSustain": 4,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 45,
                    "feedback": 14,
                    "carrierTremolo": 80,
                    "carrierAttack": 55,
                    "carrierSustain": 52,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Seashore",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 62,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 8,
                    "carrierAttack": 20,
                    "carrierSustain": 243,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Bird Tweet",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 245,
                    "modulatorAttack": 235,
                    "modulatorSustain": 3,
                    "modulatorWaveform": 0,
                    "modulatorKey": 192,
                    "modulatorOutput": 20,
                    "feedback": 7,
                    "carrierTremolo": 246,
                    "carrierAttack": 69,
                    "carrierSustain": 104,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Telephone Ring",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 218,
                    "modulatorSustain": 113,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 8,
                    "carrierTremolo": 202,
                    "carrierAttack": 176,
                    "carrierSustain": 23,
                    "carrierWaveform": 1,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Helicopter",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 17,
            "voices": [
                {
                    "modulatorTremolo": 240,
                    "modulatorAttack": 30,
                    "modulatorSustain": 17,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 8,
                    "carrierTremolo": 226,
                    "carrierAttack": 33,
                    "carrierSustain": 17,
                    "carrierWaveform": 1,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": -24
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Applause",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 65,
            "voices": [
                {
                    "modulatorTremolo": 239,
                    "modulatorAttack": 83,
                    "modulatorSustain": 0,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 6,
                    "feedback": 14,
                    "carrierTremolo": 239,
                    "carrierAttack": 16,
                    "carrierSustain": 2,
                    "carrierWaveform": 3,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Gun Shot",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 12,
                    "modulatorAttack": 240,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 4,
                    "carrierAttack": 246,
                    "carrierSustain": 230,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": -12
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Bass Drum",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 38,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 87,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 251,
                    "carrierSustain": 70,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Bass Drum",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 25,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 250,
                    "modulatorSustain": 71,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 6,
                    "carrierTremolo": 0,
                    "carrierAttack": 249,
                    "carrierSustain": 6,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Slide Stick",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 83,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 253,
                    "modulatorSustain": 103,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 6,
                    "carrierTremolo": 3,
                    "carrierAttack": 247,
                    "carrierSustain": 120,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Acoustic Snare",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 32,
            "voices": [
                {
                    "modulatorTremolo": 15,
                    "modulatorAttack": 247,
                    "modulatorSustain": 20,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 5,
                    "feedback": 14,
                    "carrierTremolo": 0,
                    "carrierAttack": 249,
                    "carrierSustain": 71,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Hand Clap",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 225,
                    "modulatorAttack": 136,
                    "modulatorSustain": 251,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 15,
                    "carrierTremolo": 255,
                    "carrierAttack": 166,
                    "carrierSustain": 168,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Electric Snare",
            "data": {},
            "flags": 5,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": true,
            "fineTuning": 128,
            "fixedNote": 36,
            "voices": [
                {
                    "modulatorTremolo": 6,
                    "modulatorAttack": 170,
                    "modulatorSustain": 255,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 250,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 63,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 42
                }
            ]
        },
        {
            "name": "Low Floor Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 15,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 108,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 7,
                    "carrierTremolo": 3,
                    "carrierAttack": 247,
                    "carrierSustain": 56,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Closed High-Hat",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 88,
            "voices": [
                {
                    "modulatorTremolo": 12,
                    "modulatorAttack": 152,
                    "modulatorSustain": 94,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 15,
                    "carrierTremolo": 15,
                    "carrierAttack": 251,
                    "carrierSustain": 6,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Floor Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 19,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 120,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 7,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 55,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Pedal High Hat",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 88,
            "voices": [
                {
                    "modulatorTremolo": 12,
                    "modulatorAttack": 120,
                    "modulatorSustain": 94,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 15,
                    "carrierTremolo": 10,
                    "carrierAttack": 138,
                    "carrierSustain": 43,
                    "carrierWaveform": 3,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 21,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 55,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 3,
                    "carrierTremolo": 2,
                    "carrierAttack": 247,
                    "carrierSustain": 55,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Open High Hat",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 79,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 199,
                    "modulatorSustain": 1,
                    "modulatorWaveform": 2,
                    "modulatorKey": 64,
                    "modulatorOutput": 5,
                    "feedback": 14,
                    "carrierTremolo": 11,
                    "carrierAttack": 249,
                    "carrierSustain": 51,
                    "carrierWaveform": 2,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low-Mid Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 26,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 55,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 3,
                    "carrierTremolo": 2,
                    "carrierAttack": 247,
                    "carrierSustain": 55,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High-Mid Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 28,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 55,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 3,
                    "carrierTremolo": 2,
                    "carrierAttack": 247,
                    "carrierSustain": 55,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Crash Cymbal 1",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 4,
                    "modulatorAttack": 194,
                    "modulatorSustain": 230,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 16,
                    "feedback": 14,
                    "carrierTremolo": 0,
                    "carrierAttack": 232,
                    "carrierSustain": 67,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Tom",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 32,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 245,
                    "modulatorSustain": 55,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 3,
                    "carrierTremolo": 2,
                    "carrierAttack": 247,
                    "carrierSustain": 55,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Ride Cymbal 1",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 253,
                    "modulatorSustain": 18,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 10,
                    "carrierTremolo": 2,
                    "carrierAttack": 253,
                    "carrierSustain": 5,
                    "carrierWaveform": 2,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Chinses Cymbal",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 96,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 228,
                    "modulatorSustain": 133,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 14,
                    "carrierTremolo": 192,
                    "carrierAttack": 215,
                    "carrierSustain": 52,
                    "carrierWaveform": 2,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Ride Bell",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 72,
            "voices": [
                {
                    "modulatorTremolo": 4,
                    "modulatorAttack": 226,
                    "modulatorSustain": 230,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 16,
                    "feedback": 14,
                    "carrierTremolo": 1,
                    "carrierAttack": 184,
                    "carrierSustain": 68,
                    "carrierWaveform": 1,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Tambourine",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 79,
            "voices": [
                {
                    "modulatorTremolo": 2,
                    "modulatorAttack": 118,
                    "modulatorSustain": 119,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 7,
                    "feedback": 15,
                    "carrierTremolo": 1,
                    "carrierAttack": 152,
                    "carrierSustain": 103,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Splash Cymbal",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 69,
            "voices": [
                {
                    "modulatorTremolo": 4,
                    "modulatorAttack": 148,
                    "modulatorSustain": 112,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 1,
                    "feedback": 14,
                    "carrierTremolo": 7,
                    "carrierAttack": 198,
                    "carrierSustain": 163,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Cowbell",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 71,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 253,
                    "modulatorSustain": 103,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 6,
                    "carrierTremolo": 1,
                    "carrierAttack": 246,
                    "carrierSustain": 152,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Crash Cymbal 2",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 4,
                    "modulatorAttack": 194,
                    "modulatorSustain": 230,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 16,
                    "feedback": 14,
                    "carrierTremolo": 0,
                    "carrierAttack": 232,
                    "carrierSustain": 67,
                    "carrierWaveform": 3,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Vibraslap",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 1,
                    "modulatorAttack": 249,
                    "modulatorSustain": 181,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 11,
                    "carrierTremolo": 191,
                    "carrierAttack": 212,
                    "carrierSustain": 80,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Ride Cymbal 2",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 253,
                    "modulatorSustain": 18,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 10,
                    "carrierTremolo": 2,
                    "carrierAttack": 253,
                    "carrierSustain": 5,
                    "carrierWaveform": 2,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Bongo",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 4,
                    "carrierTremolo": 0,
                    "carrierAttack": 250,
                    "carrierSustain": 38,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Bango",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 54,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 4,
                    "carrierTremolo": 0,
                    "carrierAttack": 250,
                    "carrierSustain": 38,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Mute High Conga",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 72,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Open High Conga",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 67,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Conga",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 60,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 2,
                    "modulatorKey": 128,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Timbale",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 55,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 1,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Timbale",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 48,
            "voices": [
                {
                    "modulatorTremolo": 3,
                    "modulatorAttack": 251,
                    "modulatorSustain": 86,
                    "modulatorWaveform": 0,
                    "modulatorKey": 128,
                    "modulatorOutput": 1,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 247,
                    "carrierSustain": 23,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Agogo",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 77,
            "voices": [
                {
                    "modulatorTremolo": 1,
                    "modulatorAttack": 253,
                    "modulatorSustain": 103,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 8,
                    "carrierTremolo": 1,
                    "carrierAttack": 246,
                    "carrierSustain": 152,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Agogo",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 72,
            "voices": [
                {
                    "modulatorTremolo": 1,
                    "modulatorAttack": 253,
                    "modulatorSustain": 103,
                    "modulatorWaveform": 3,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 8,
                    "carrierTremolo": 1,
                    "carrierAttack": 246,
                    "carrierSustain": 152,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Cabasa",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 88,
            "voices": [
                {
                    "modulatorTremolo": 12,
                    "modulatorAttack": 120,
                    "modulatorSustain": 94,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 15,
                    "carrierTremolo": 10,
                    "carrierAttack": 138,
                    "carrierSustain": 43,
                    "carrierWaveform": 3,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Maracas",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 90,
                    "modulatorSustain": 214,
                    "modulatorWaveform": 2,
                    "modulatorKey": 0,
                    "modulatorOutput": 14,
                    "feedback": 10,
                    "carrierTremolo": 191,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Short Whistle",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 49,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 199,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 10,
                    "carrierTremolo": 128,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Long Whistle",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 49,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 199,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 10,
                    "carrierTremolo": 128,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Short Guiro",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 49,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 199,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 10,
                    "carrierTremolo": 128,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Long Guiro",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 49,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 199,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 10,
                    "carrierTremolo": 128,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Claves",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 73,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 248,
                    "modulatorSustain": 209,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 6,
                    "carrierTremolo": 18,
                    "carrierAttack": 245,
                    "carrierSustain": 120,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "High Wood Block",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 68,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 248,
                    "modulatorSustain": 209,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 6,
                    "carrierTremolo": 18,
                    "carrierAttack": 245,
                    "carrierSustain": 120,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Low Wood Block",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 61,
            "voices": [
                {
                    "modulatorTremolo": 19,
                    "modulatorAttack": 248,
                    "modulatorSustain": 209,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 4,
                    "feedback": 6,
                    "carrierTremolo": 18,
                    "carrierAttack": 245,
                    "carrierSustain": 120,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Mute Cuica",
            "data": {},
            "flags": 0,
            "fixedPitch": false,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 0,
            "voices": [
                {
                    "modulatorTremolo": 1,
                    "modulatorAttack": 94,
                    "modulatorSustain": 220,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 11,
                    "feedback": 10,
                    "carrierTremolo": 191,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Open Cuica",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 49,
            "voices": [
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 249,
                    "modulatorSustain": 199,
                    "modulatorWaveform": 1,
                    "modulatorKey": 0,
                    "modulatorOutput": 7,
                    "feedback": 10,
                    "carrierTremolo": 128,
                    "carrierAttack": 255,
                    "carrierSustain": 255,
                    "carrierWaveform": 0,
                    "carrierKey": 192,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Mute Triangle",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 90,
            "voices": [
                {
                    "modulatorTremolo": 197,
                    "modulatorAttack": 242,
                    "modulatorSustain": 96,
                    "modulatorWaveform": 0,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 8,
                    "carrierTremolo": 212,
                    "carrierAttack": 244,
                    "carrierSustain": 122,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        },
        {
            "name": "Open Triangle",
            "data": {},
            "flags": 1,
            "fixedPitch": true,
            "unknown": false,
            "doubleVoice": false,
            "fineTuning": 128,
            "fixedNote": 90,
            "voices": [
                {
                    "modulatorTremolo": 133,
                    "modulatorAttack": 242,
                    "modulatorSustain": 96,
                    "modulatorWaveform": 1,
                    "modulatorKey": 64,
                    "modulatorOutput": 15,
                    "feedback": 8,
                    "carrierTremolo": 148,
                    "carrierAttack": 242,
                    "carrierSustain": 183,
                    "carrierWaveform": 0,
                    "carrierKey": 128,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                },
                {
                    "modulatorTremolo": 0,
                    "modulatorAttack": 0,
                    "modulatorSustain": 240,
                    "modulatorWaveform": 0,
                    "modulatorKey": 0,
                    "modulatorOutput": 0,
                    "feedback": 0,
                    "carrierTremolo": 0,
                    "carrierAttack": 0,
                    "carrierSustain": 240,
                    "carrierWaveform": 0,
                    "carrierKey": 0,
                    "carrierOutput": 0,
                    "baseNoteOffset": 0
                }
            ]
        }
    ],
    "lump": {}
}

},{}],3:[function(_dereq_,module,exports){
var extend = _dereq_('extend');

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
},{"extend":18}],4:[function(_dereq_,module,exports){
var extend = _dereq_('extend');

function LAA(opl, options){
    options = options || {};

    this.opl = opl;
    this.channels = [];
    this.tracks = [];
    this.adlib_data = new Int32Array(256);
    
    var Midi = options.Midi;
    if (typeof Midi != 'undefined'){
        this.Midi = Midi;
        this.midiFile = new Midi.File();
        this.midiTrack = new Midi.Track();
        this.midiFile.addTrack(this.midiTrack);
    }

    for (var i = 0; i < 16; i++){
        this.channels.push(new MidiChannel());
        this.tracks.push(new MidiTrack());
        if (typeof Midi != 'undefined'){
            this.channels[i].midiTrack = this.midiTrack;
        }
    }

    this.myinsbank = new Array(128);
    this.smyinsbank = new Array(128);

    for (var i = 0; i < 128; i++){
        this.myinsbank[i] = new Int32Array(16);
        this.smyinsbank[i] = new Int32Array(16);
    }

    this.chp = new Array(18);
    for (var i = 0; i < 18; i++){
        this.chp[i] = new Int32Array(3);
    }
}
module.exports = LAA;

extend(LAA.prototype, {
	ADL: [0x41, 0x44, 0x4c],
    LUCAS_STYLE: 1,
    CMF_STYLE: 2,
    MIDI_STYLE: 4,
    SIERRA_STYLE: 8,
    ADLIB_MELODIC: 0,
    ADLIB_RYTHM: 1,
    FILE_LUCAS: 'LucasArts AdLib MIDI',
    adlib_opadd: [0x00, 0x01, 0x02, 0x08, 0x09, 0x0A, 0x10, 0x11, 0x12],
    ops: [0x20, 0x20, 0x40, 0x40, 0x60, 0x60, 0x80, 0x80, 0xe0, 0xe0, 0xc0],
    map_chan: [0x14, 0x12, 0x15, 0x11],
    fnums: [0x16b, 0x181, 0x198, 0x1b0, 0x1ca, 0x1e5, 0x202, 0x220, 0x241, 0x263, 0x287, 0x2ae],
    percussion_map: [6, 7, 8, 8, 7],
    load: function(buffer){
        if (!(buffer instanceof Uint8Array)) buffer = new Uint8Array(buffer);
        
        this.position = 0;
        if (buffer[0] == this.ADL[0] && buffer[1] == this.ADL[1] && buffer[2] == this.ADL[2]){
            this.type = this.FILE_LUCAS;
            this.subsongs = 1;
        }

        this.data = buffer;
        this.rewind(0);
    },
    update: function(){
        var w, note, vel, ctrl, nv, x, l, lnum;
        var i = 0, j, c;
        var on, onl, numchan;
        var ret;

        if (this.doing == 1){
            for (var curtrack = 0; curtrack < 16; curtrack++){
                if (this.tracks[curtrack].on != 0){
                    this.position = this.tracks[curtrack].pos;

                    if (this.type != this.FILE_SIERRA && this.type != this.FILE_ADVSIERRA) this.tracks[curtrack].iwait += this.getval();
                    else this.tracks[curtrack].iwait += this.getnext(1);

                    this.tracks[curtrack].pos = this.position;
                }
            }

            this.doing = 0;
        }

        this.iwait = 0;
        ret = 1;

        while (this.iwait == 0 && ret == 1){
            for (var curtrack = 0; curtrack < 16; curtrack++){
                if (this.tracks[curtrack].on != 0 && this.tracks[curtrack].iwait == 0 && this.tracks[curtrack].pos < this.tracks[curtrack].tend){
                    this.position = this.tracks[curtrack].pos;
                    var v = this.getnext(1);

                    if (v < 0x80){
                        v = this.tracks[curtrack].pv;
                        this.position--;
                    }
                    this.tracks[curtrack].pv = v;

                    var c = v & 0x0f;
                    switch (v & 0xf0){
            			case 0x80: //note off
                            var note = this.getnext(1);
                            var vel = this.getnext(1);
                            for (var i = 0; i < 9; i++){
                                if (this.chp[i][0] == c && this.chp[i][1] == note){
                                    this.midi_fm_endnote(i);
                                    this.chp[i][0] = -1;
                                }
                            }
                            break;
                        case 0x90: //note on
                            var note = this.getnext(1);
                            var vel = this.getnext(1);
                            var numchan = this.adlib_mode == this.ADLIB_RYTHM ? 6 : 9;

                            if (this.channels[c].on != 0){
                                for (var i = 0; i < 18; i++) this.chp[i][2]++;

                                if (c < 11 || this.adlib_mode == this.ADLIB_MELODIC){
                                    var j = 0;
                                    var on = -1;
                                    var onl = 0;

                                    for (var i = 0; i < numchan; i++){
                                	    if (this.chp[i][0] == -1 && this.chp[i][2] > onl){
                                            onl = this.chp[i][2];
                                            on = i;
                                            j = 1;
                                        }
                                    }

                                    if (on == -1){
                            			onl = 0;
                            			for (var i = 0; i < numchan; i++){
                                			if (this.chp[i][2] > onl){
                                                onl = this.chp[i][2];
                                                on = i;
                                            }
                                        }
                        		    }

                                    if (j == 0) this.midi_fm_endnote(on);
                                }else on = this.percussion_map[c - 11];

                                if (vel != 0 && this.channels[c].inum >= 0 && this.channels[c].inum < 128){
                                    if (this.adlib_mode == this.ADLIB_MELODIC || c < 12) this.midi_fm_instrument(on, this.channels[c].ins);
                                    else this.midi_fm_percussion(c, this.channels[c].ins);

                                    var nv;
                                    if ((this.adlib_style & this.MIDI_STYLE) != 0){
                                        nv = ((this.channels[c].vol * vel) / 128) | 0;
                                        if ((this.adlib_style & this.LUCAS_STYLE) != 0) nv *= 2;
                                        if (nv > 127) nv = 127;

                                        nv = this.midi_fm_vol_table[nv];
                                        if ((this.adlib_style & this.LUCAS_STYLE) != 0) nv = (Math.sqrt(nv) * 11) | 0;
                                    }else nv = vel;

                                    this.midi_fm_playnote(on, (note + this.channels[c].nshift), nv * 2);
                                    

                                    this.chp[on][0] = c;
                                    this.chp[on][1] = note;
                                    this.chp[on][2] = 0;
                                    
                                    if (this.midiFile){
                                        this.midiTrack.note(c, note, 32);
                                    }

                                    if (this.adlib_mode == this.ADLIB_RYTHM && c >= 11){
                        		        this.midi_write_adlib(0xbd, this.adlib_data[0xbd] & ~(0x10 >> (c - 11)));
                        		        this.midi_write_adlib(0xbd, this.adlib_data[0xbd] | (0x10 >> (c - 11)));
                        		    }
                                }else{
                                    if (vel == 0){ //same code as end note
                                        for (var i = 0; i < 9; i++){
                                            if (this.chp[i][0] == c && this.chp[i][1] == note){
                                                this.midi_fm_endnote(i);
                                                this.midiTrack.noteOff(c, note);
                                                this.chp[i][0] = -1;
                                            }
                                        }
                                    }else{
                                        this.chp[on][0] = -1;
                                        this.chp[on][2] = 0;
                                    }
                                }
                            }else console.error('channel off', c, this.position);

                            break;
                        case 0xa0: //key after touch
                            var note = this.getnext(1);
                            var vel = this.getnext(1);
                            break;
                        case 0xb0: //control change .. pitch bend?
                            var ctrl = this.getnext(1);
                            var vel = this.getnext(1);
                            switch (ctrl){
                                case 0x07:
                                    this.channels[c].vol = vel;
                                    break;
                                case 0x67:
                                    if ((this.adlib_style & this.CMF_STYLE) != 0){
            			                this.adlib_mode = vel;
            			                if (this.adlib_mode == this.ADLIB_RYTHM) this.midi_write_adlib(0xbd, this.adlib_data[0xbd] | (1 << 5));
            			                else this.midi_write_adlib(0xbd, this.adlib_data[0xbd] & ~(1 << 5));
            			            }
                                    break;
                            }
                            break;
                        case 0xc0: //patch change
                            var x = this.getnext(1);
                            this.channels[c].inum = x;
                            if (this.midiFile) this.channels[c].midiTrack.instrument(c, x);
                            for (var j = 0; j < 11; j++) this.channels[c].ins[j] = this.myinsbank[this.channels[c].inum][j];
                            break;
                        case 0xd0: //chanel touch
                            var x = this.getnext(1);
                            break;
                        case 0xe0: //pitch wheel
                            var x1 = this.getnext(1);
                            var x2 = this.getnext(1);
                            break;
                        case 0xf0: // ???
                            switch (v){
                                case 0xf0:
                                case 0xf7: //sysex
                                    var l = this.getval();
                                    var t = 0;
                                    if (this.datalook(this.position + l) == 0xf7) t = 1;

                                    if (this.datalook(this.position) == 0x7d && this.datalook(this.position + 1) == 0x10 && this.datalook(this.position + 2) < 16){
                                        this.adlib_style = this.LUCAS_STYLE | this.MIDI_STYLE;

                                        this.getnext(1);
                                        this.getnext(1);
            							c = this.getnext(1);
            							this.getnext(1);

                                        this.channels[c].ins[0] = (this.getnext(1) << 4) + this.getnext(1);
                                        this.channels[c].ins[2] = 0xff - (((this.getnext(1) << 4) + this.getnext(1)) & 0x3f);
                                        this.channels[c].ins[4] = 0xff - ((this.getnext(1) << 4) + this.getnext(1));
                                        this.channels[c].ins[6] = 0xff - ((this.getnext(1) << 4) + this.getnext(1));
                                        this.channels[c].ins[8] = (this.getnext(1) << 4) + this.getnext(1);

                                        this.channels[c].ins[1] = (this.getnext(1) << 4) + this.getnext(1);
                                        this.channels[c].ins[3] = 0xff - (((this.getnext(1) << 4) + this.getnext(1)) & 0x3f);
                                        this.channels[c].ins[5] = 0xff - ((this.getnext(1) << 4) + this.getnext(1));
                                        this.channels[c].ins[7] = 0xff - ((this.getnext(1) << 4) + this.getnext(1));
                                        this.channels[c].ins[9] = (this.getnext(1) << 4) + this.getnext(1);

                                        i = (this.getnext(1) << 4) + this.getnext(1);
                                        this.channels[c].ins[10] = i;

                                        i = 11;
                                        this.getnext(l - 26);
                                    }else{
                                        for (var j = 0; j < l; j++){
                                            this.getnext(1);
                                        }
                                    }

                                    if (t == 1) this.getnext(1);
                                    break;
                                case 0xf1: break;
                                case 0xf2: this.getnext(2); break;
                                case 0xf3: this.getnext(1); break;
                                case 0xf4: break;
                                case 0xf5: break;
                                case 0xf6: //something
                                case 0xf8:
                                case 0xfa:
                                case 0xfb:
                                case 0xfc:
                                    //this ends the track for sierra.
                                    if (this.type == this.FILE_SIERRA || this.type == this.FILE_ADVSIERRA){
                                        this.tracks[curtrack].tend = this.position;
                                    }
                                    break;
                                case 0xfe: break;
                                case 0xfd: break;
                                case 0xff:
                                    var v = this.getnext(1);
                                    var l = this.getval();

                                    if (v == 0x51){
                                        this.msqtr = this.getnext(l); //set tempo
                                    }else{
                                        for (var i = 0; i < l; i++) this.getnext(1);
                                    }
                                    break;
                            }
                            break;
                        default: console.error('!', v); // if we get down here, a error occurred
                    }

                    if (this.position < this.tracks[curtrack].tend){
                        this.tracks[curtrack].iwait = this.type != this.FILE_SIERRA && this.type != this.FILE_ADVSIERRA ? this.getval() : this.getnext(1);
                    }else this.tracks[curtrack].iwait = 0;

                    this.tracks[curtrack].pos = this.position;
                }
            }

            ret = 0; //end of song.
            this.iwait = 0;
            for (var curtrack = 0; curtrack < 16; curtrack++){
                if (this.tracks[curtrack].on == 1 && this.tracks[curtrack].pos < this.tracks[curtrack].tend){
                    ret = 1;  //not yet..
                    break;
                }
            }

            if (ret == 1){
                this.iwait = 0xffffff;  // bigger than any wait can be!
                for (var curtrack = 0; curtrack < 16; curtrack++){
                   if (this.tracks[curtrack].on == 1 &&
                       this.tracks[curtrack].pos < this.tracks[curtrack].tend &&
                       this.tracks[curtrack].iwait < this.iwait) this.iwait = this.tracks[curtrack].iwait;
                }
            }
        }

        if (this.iwait != 0 && ret == 1){
            for (var curtrack = 0; curtrack < 16; curtrack++){
                if (this.tracks[curtrack].on != 0) this.tracks[curtrack].iwait -= this.iwait;
            }

            this.fwait = ((this.iwait / this.deltas) * (this.msqtr / 1000000));
        }else this.fwait = 1/50;  // 1/50th of a second

    	return ret != 0;
    },
    rewind: function(subsong){
        this.position = 0;
        this.tins = 0;

        this.adlib_style = this.MIDI_STYLE | this.CMF_STYLE;
        this.adlib_mode = this.ADLIB_MELODIC;

        for (var i = 0; i < 128; i++)
        {
            for (var j = 0; j < 14; j++){
                this.myinsbank[i][j] = this.midi_fm_instruments[i][j];
            }

            this.myinsbank[i][14] = 0;
            this.myinsbank[i][15] = 0;
        }

        for (var i = 0; i < 16; i++){
            this.channels[i].inum = 0;
            for (var j = 0; j < 11; j++){
                this.channels[i].ins[j] = this.myinsbank[this.channels[i].inum][j];
            }

            this.channels[i].vol = 127;
            this.channels[i].nshift = -25;
            this.channels[i].on = 1;
        }

        for (var i = 0; i < 9; i++){
            this.chp[i][0] = -1;
            this.chp[i][2] = 0;
        }

        this.deltas = 250;  // just a number,  not a standard
        this.msqtr = 500000;
        this.fwait = 1/123; // gotta be a small thing.. sorta like nothing
        this.iwait = 0;

        this.subsongs = 1;

        for (var i = 0; i < 16; i++){
            this.tracks[i].tend = 0;
            this.tracks[i].spos = 0;
            this.tracks[i].pos = 0;
            this.tracks[i].iwait = 0;
            this.tracks[i].on = 0;
            this.tracks[i].pv = 0;
        }

        this.curtrack = 0;
        this.position = 0;

        var n = this.getnext(1);
        switch (this.type){
            case this.FILE_LUCAS:
                this.getnext(24); //skip junk and get to the midi.
                this.adlib_style = this.LUCAS_STYLE | this.MIDI_STYLE;
                //note: no break, we go right into midi headers...
            case this.FILE_MIDI:
                if (this.type != this.FILE_LUCAS) this.tins=128;
                this.getnext(11);  //skip header
                this.deltas = this.getnext(2);
                this.getnext(4);

                var track = this.tracks[0];
                track.on = 1;
                track.tend = this.getnext(4);
                track.spos = this.position;
                break;
        }

        for (var i = 0; i < 16; i++){
            if (this.tracks[i].on != 0){
                this.tracks[i].pos = this.tracks[i].spos;
                this.tracks[i].pv = 0;
                this.tracks[i].iwait = 0;
            }
        }

        this.doing = 1;
        this.midi_fm_reset();
    },
    refresh: function(){
        return Math.min(this.fwait, 100);
    },
    datalook: function(pos){
        return this.position < 0 || this.position >= this.data.length ? 0 : this.data[pos];
    },
    getnexti: function(num){
        var v = 0;

        for (var i = 0; i < num; i++){
            v += (this.datalook(this.position) << (8 * i));
            this.position++;
        }

        return v;
    },
    getnext: function(num){
        var v = 0;

        for (var i = 0; i < num; i++){
            v <<= 8;
            v += this.datalook(this.position);
            this.position++;
        }

        return v;
    },
    getval: function(){
        var b = this.getnext(1);
        var v = b & 0x7f;

        while ((b & 0x80) !=0){
            b = this.getnext(1);
            v = (v << 7) + (b & 0x7f);
		}

    	return v;
    },
    midi_write_adlib: function(r, v){
        this.opl.write(0, r, v);
        this.adlib_data[r] = v;
    },
    midi_fm_instrument: function(voice, inst){
        this.midi_write_adlib(0x20 + this.adlib_opadd[voice], inst[0]);
        this.midi_write_adlib(0x23 + this.adlib_opadd[voice], inst[1]);

        if ((this.adlib_style & this.LUCAS_STYLE) != 0){
            this.midi_write_adlib(0x43 + this.adlib_opadd[voice], 0x3f);
            if ((inst[10] & 1) == 0) this.midi_write_adlib(0x40 + this.adlib_opadd[voice], inst[2]);
            else this.midi_write_adlib(0x40 + this.adlib_opadd[voice], 0x3f);
        }

        this.midi_write_adlib(0x60 + this.adlib_opadd[voice], inst[4]);
        this.midi_write_adlib(0x63 + this.adlib_opadd[voice], inst[5]);
        this.midi_write_adlib(0x80 + this.adlib_opadd[voice], inst[6]);
        this.midi_write_adlib(0x83 + this.adlib_opadd[voice], inst[7]);
        this.midi_write_adlib(0xe0 + this.adlib_opadd[voice], inst[8]);
        this.midi_write_adlib(0xe3 + this.adlib_opadd[voice], inst[9]);
    },
    midi_fm_percussion: function(ch, inst){
        var	opadd = this.map_chan[ch - 12];

        this.midi_write_adlib(0x20 + opadd, inst[0]);
        this.midi_write_adlib(0x40 + opadd, inst[2]);
        this.midi_write_adlib(0x60 + opadd, inst[4]);
        this.midi_write_adlib(0x80 + opadd, inst[6]);
        this.midi_write_adlib(0xe0 + opadd, inst[8]);
    },
    midi_fm_volume: function(voice, volume){
        var vol = volume >> 2;

        if ((this.adlib_data[0xc0 + voice] & 1) == 1) this.midi_write_adlib(0x40 + this.adlib_opadd[voice], ((63 - vol) | (this.adlib_data[0x40 + this.adlib_opadd[voice]] & 0xc0)));
        this.midi_write_adlib(0x43 + this.adlib_opadd[voice], ((63 - vol) | (this.adlib_data[0x43 + this.adlib_opadd[voice]] & 0xc0)));
    },
    midi_fm_playnote: function(voice, note, volume){
        if (note < 0) note = 12 - (note % 12);
        var freq = this.fnums[note % 12];
        var oct = (note / 12) | 0;

        this.midi_fm_volume(voice, volume);
        this.midi_write_adlib(0xa0 + voice, freq & 0xff);

    	var c = ((freq & 0x300) >> 8) + (oct << 2) + (this.adlib_mode == this.ADLIB_MELODIC || voice < 6 ? (1 << 5) : 0);
        this.midi_write_adlib(0xb0 + voice, c);
    },
    midi_fm_endnote: function(voice){
        this.midi_write_adlib(0xb0 + voice, (this.adlib_data[0xb0 + voice] & (255 - 32)));
    },
    midi_fm_reset: function(){
        for (var i = 0; i < 256; i++){
            this.midi_write_adlib(i, 0);
        }

        for (var i = 0xc0; i <= 0xc8; i++){
            this.midi_write_adlib(i, 0xf0);
        }

        this.midi_write_adlib(0x01, 0x20);
        this.midi_write_adlib(0xbd, 0xc0);
    },
    midi_fm_instruments: [
        [ 0x21, 0x21, 0x8f, 0x0c, 0xf2, 0xf2, 0x45, 0x76, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Acoustic Grand */
        [ 0x31, 0x21, 0x4b, 0x09, 0xf2, 0xf2, 0x54, 0x56, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Bright Acoustic */
        [ 0x31, 0x21, 0x49, 0x09, 0xf2, 0xf2, 0x55, 0x76, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Electric Grand */
        [ 0xb1, 0x61, 0x0e, 0x09, 0xf2, 0xf3, 0x3b, 0x0b, 0x00, 0x00, 0x06, 0, 0, 0 ], /* Honky-Tonk */
        [ 0x01, 0x21, 0x57, 0x09, 0xf1, 0xf1, 0x38, 0x28, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Electric Piano 1 */
        [ 0x01, 0x21, 0x93, 0x09, 0xf1, 0xf1, 0x38, 0x28, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Electric Piano 2 */
        [ 0x21, 0x36, 0x80, 0x17, 0xa2, 0xf1, 0x01, 0xd5, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Harpsichord */
        [ 0x01, 0x01, 0x92, 0x09, 0xc2, 0xc2, 0xa8, 0x58, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Clav */
        [ 0x0c, 0x81, 0x5c, 0x09, 0xf6, 0xf3, 0x54, 0xb5, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Celesta */
        [ 0x07, 0x11, 0x97, 0x89, 0xf6, 0xf5, 0x32, 0x11, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Glockenspiel */
        [ 0x17, 0x01, 0x21, 0x09, 0x56, 0xf6, 0x04, 0x04, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Music Box */
        [ 0x18, 0x81, 0x62, 0x09, 0xf3, 0xf2, 0xe6, 0xf6, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Vibraphone */
        [ 0x18, 0x21, 0x23, 0x09, 0xf7, 0xe5, 0x55, 0xd8, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Marimba */
        [ 0x15, 0x01, 0x91, 0x09, 0xf6, 0xf6, 0xa6, 0xe6, 0x00, 0x00, 0x04, 0, 0, 0 ], /* Xylophone */
        [ 0x45, 0x81, 0x59, 0x89, 0xd3, 0xa3, 0x82, 0xe3, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Tubular Bells */
        [ 0x03, 0x81, 0x49, 0x89, 0x74, 0xb3, 0x55, 0x05, 0x01, 0x00, 0x04, 0, 0, 0 ], /* Dulcimer */
        [ 0x71, 0x31, 0x92, 0x09, 0xf6, 0xf1, 0x14, 0x07, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Drawbar Organ */
        [ 0x72, 0x30, 0x14, 0x09, 0xc7, 0xc7, 0x58, 0x08, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Percussive Organ */
        [ 0x70, 0xb1, 0x44, 0x09, 0xaa, 0x8a, 0x18, 0x08, 0x00, 0x00, 0x04, 0, 0, 0 ], /* Rock Organ */
        [ 0x23, 0xb1, 0x93, 0x09, 0x97, 0x55, 0x23, 0x14, 0x01, 0x00, 0x04, 0, 0, 0 ], /* Church Organ */
        [ 0x61, 0xb1, 0x13, 0x89, 0x97, 0x55, 0x04, 0x04, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Reed Organ */
        [ 0x24, 0xb1, 0x48, 0x09, 0x98, 0x46, 0x2a, 0x1a, 0x01, 0x00, 0x0c, 0, 0, 0 ], /* Accoridan */
        [ 0x61, 0x21, 0x13, 0x09, 0x91, 0x61, 0x06, 0x07, 0x01, 0x00, 0x0a, 0, 0, 0 ], /* Harmonica */
        [ 0x21, 0xa1, 0x13, 0x92, 0x71, 0x61, 0x06, 0x07, 0x00, 0x00, 0x06, 0, 0, 0 ], /* Tango Accordian */
        [ 0x02, 0x41, 0x9c, 0x89, 0xf3, 0xf3, 0x94, 0xc8, 0x01, 0x00, 0x0c, 0, 0, 0 ], /* Acoustic Guitar(nylon) */
        [ 0x03, 0x11, 0x54, 0x09, 0xf3, 0xf1, 0x9a, 0xe7, 0x01, 0x00, 0x0c, 0, 0, 0 ], /* Acoustic Guitar(steel) */
        [ 0x23, 0x21, 0x5f, 0x09, 0xf1, 0xf2, 0x3a, 0xf8, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Electric Guitar(jazz) */
        [ 0x03, 0x21, 0x87, 0x89, 0xf6, 0xf3, 0x22, 0xf8, 0x01, 0x00, 0x06, 0, 0, 0 ], /* Electric Guitar(clean) */
        [ 0x03, 0x21, 0x47, 0x09, 0xf9, 0xf6, 0x54, 0x3a, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Electric Guitar(muted) */
        [ 0x23, 0x21, 0x4a, 0x0e, 0x91, 0x84, 0x41, 0x19, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Overdriven Guitar */
        [ 0x23, 0x21, 0x4a, 0x09, 0x95, 0x94, 0x19, 0x19, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Distortion Guitar */
        [ 0x09, 0x84, 0xa1, 0x89, 0x20, 0xd1, 0x4f, 0xf8, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Guitar Harmonics */
        [ 0x21, 0xa2, 0x1e, 0x09, 0x94, 0xc3, 0x06, 0xa6, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Acoustic Bass */
        [ 0x31, 0x31, 0x12, 0x09, 0xf1, 0xf1, 0x28, 0x18, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Electric Bass(finger) */
        [ 0x31, 0x31, 0x8d, 0x09, 0xf1, 0xf1, 0xe8, 0x78, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Electric Bass(pick) */
        [ 0x31, 0x32, 0x5b, 0x09, 0x51, 0x71, 0x28, 0x48, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Fretless Bass */
        [ 0x01, 0x21, 0x8b, 0x49, 0xa1, 0xf2, 0x9a, 0xdf, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Slap Bass 1 */
        [ 0x21, 0x21, 0x8b, 0x11, 0xa2, 0xa1, 0x16, 0xdf, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Slap Bass 2 */
        [ 0x31, 0x31, 0x8b, 0x09, 0xf4, 0xf1, 0xe8, 0x78, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Synth Bass 1 */
        [ 0x31, 0x31, 0x12, 0x09, 0xf1, 0xf1, 0x28, 0x18, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Synth Bass 2 */
        [ 0x31, 0x21, 0x15, 0x09, 0xdd, 0x56, 0x13, 0x26, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Violin */
        [ 0x31, 0x21, 0x16, 0x09, 0xdd, 0x66, 0x13, 0x06, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Viola */
        [ 0x71, 0x31, 0x49, 0x09, 0xd1, 0x61, 0x1c, 0x0c, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Cello */
        [ 0x21, 0x23, 0x4d, 0x89, 0x71, 0x72, 0x12, 0x06, 0x01, 0x00, 0x02, 0, 0, 0 ], /* Contrabass */
        [ 0xf1, 0xe1, 0x40, 0x09, 0xf1, 0x6f, 0x21, 0x16, 0x01, 0x00, 0x02, 0, 0, 0 ], /* Tremolo Strings */
        [ 0x02, 0x01, 0x1a, 0x89, 0xf5, 0x85, 0x75, 0x35, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Pizzicato Strings */
        [ 0x02, 0x01, 0x1d, 0x89, 0xf5, 0xf3, 0x75, 0xf4, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Orchestral Strings */
        [ 0x10, 0x11, 0x41, 0x09, 0xf5, 0xf2, 0x05, 0xc3, 0x01, 0x00, 0x02, 0, 0, 0 ], /* Timpani */
        [ 0x21, 0xa2, 0x9b, 0x0a, 0xb1, 0x72, 0x25, 0x08, 0x01, 0x00, 0x0e, 0, 0, 0 ], /* String Ensemble 1 */
        [ 0xa1, 0x21, 0x98, 0x09, 0x7f, 0x3f, 0x03, 0x07, 0x01, 0x01, 0x00, 0, 0, 0 ], /* String Ensemble 2 */
        [ 0xa1, 0x61, 0x93, 0x09, 0xc1, 0x4f, 0x12, 0x05, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* SynthStrings 1 */
        [ 0x21, 0x61, 0x18, 0x09, 0xc1, 0x4f, 0x22, 0x05, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* SynthStrings 2 */
        [ 0x31, 0x72, 0x5b, 0x8c, 0xf4, 0x8a, 0x15, 0x05, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Choir Aahs */
        [ 0xa1, 0x61, 0x90, 0x09, 0x74, 0x71, 0x39, 0x67, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Voice Oohs */
        [ 0x71, 0x72, 0x57, 0x09, 0x54, 0x7a, 0x05, 0x05, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Synth Voice */
        [ 0x90, 0x41, 0x00, 0x09, 0x54, 0xa5, 0x63, 0x45, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Orchestra Hit */
        [ 0x21, 0x21, 0x92, 0x0a, 0x85, 0x8f, 0x17, 0x09, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Trumpet */
        [ 0x21, 0x21, 0x94, 0x0e, 0x75, 0x8f, 0x17, 0x09, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Trombone */
        [ 0x21, 0x61, 0x94, 0x09, 0x76, 0x82, 0x15, 0x37, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Tuba */
        [ 0x31, 0x21, 0x43, 0x09, 0x9e, 0x62, 0x17, 0x2c, 0x01, 0x01, 0x02, 0, 0, 0 ], /* Muted Trumpet */
        [ 0x21, 0x21, 0x9b, 0x09, 0x61, 0x7f, 0x6a, 0x0a, 0x00, 0x00, 0x02, 0, 0, 0 ], /* French Horn */
        [ 0x61, 0x22, 0x8a, 0x0f, 0x75, 0x74, 0x1f, 0x0f, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Brass Section */
        [ 0xa1, 0x21, 0x86, 0x8c, 0x72, 0x71, 0x55, 0x18, 0x01, 0x00, 0x00, 0, 0, 0 ], /* SynthBrass 1 */
        [ 0x21, 0x21, 0x4d, 0x09, 0x54, 0xa6, 0x3c, 0x1c, 0x00, 0x00, 0x08, 0, 0, 0 ], /* SynthBrass 2 */
        [ 0x31, 0x61, 0x8f, 0x09, 0x93, 0x72, 0x02, 0x0b, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Soprano Sax */
        [ 0x31, 0x61, 0x8e, 0x09, 0x93, 0x72, 0x03, 0x09, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Alto Sax */
        [ 0x31, 0x61, 0x91, 0x09, 0x93, 0x82, 0x03, 0x09, 0x01, 0x00, 0x0a, 0, 0, 0 ], /* Tenor Sax */
        [ 0x31, 0x61, 0x8e, 0x09, 0x93, 0x72, 0x0f, 0x0f, 0x01, 0x00, 0x0a, 0, 0, 0 ], /* Baritone Sax */
        [ 0x21, 0x21, 0x4b, 0x09, 0xaa, 0x8f, 0x16, 0x0a, 0x01, 0x00, 0x08, 0, 0, 0 ], /* Oboe */
        [ 0x31, 0x21, 0x90, 0x09, 0x7e, 0x8b, 0x17, 0x0c, 0x01, 0x01, 0x06, 0, 0, 0 ], /* English Horn */
        [ 0x31, 0x32, 0x81, 0x09, 0x75, 0x61, 0x19, 0x19, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Bassoon */
        [ 0x32, 0x21, 0x90, 0x09, 0x9b, 0x72, 0x21, 0x17, 0x00, 0x00, 0x04, 0, 0, 0 ], /* Clarinet */
        [ 0xe1, 0xe1, 0x1f, 0x09, 0x85, 0x65, 0x5f, 0x1a, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Piccolo */
        [ 0xe1, 0xe1, 0x46, 0x09, 0x88, 0x65, 0x5f, 0x1a, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Flute */
        [ 0xa1, 0x21, 0x9c, 0x09, 0x75, 0x75, 0x1f, 0x0a, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Recorder */
        [ 0x31, 0x21, 0x8b, 0x09, 0x84, 0x65, 0x58, 0x1a, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Pan Flute */
        [ 0xe1, 0xa1, 0x4c, 0x09, 0x66, 0x65, 0x56, 0x26, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Blown Bottle */
        [ 0x62, 0xa1, 0xcb, 0x09, 0x76, 0x55, 0x46, 0x36, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Skakuhachi */
        [ 0x62, 0xa1, 0xa2, 0x09, 0x57, 0x56, 0x07, 0x07, 0x00, 0x00, 0x0b, 0, 0, 0 ], /* Whistle */
        [ 0x62, 0xa1, 0x9c, 0x09, 0x77, 0x76, 0x07, 0x07, 0x00, 0x00, 0x0b, 0, 0, 0 ], /* Ocarina */
        [ 0x22, 0x21, 0x59, 0x09, 0xff, 0xff, 0x03, 0x0f, 0x02, 0x00, 0x00, 0, 0, 0 ], /* Lead 1 (square) */
        [ 0x21, 0x21, 0x0e, 0x09, 0xff, 0xff, 0x0f, 0x0f, 0x01, 0x01, 0x00, 0, 0, 0 ], /* Lead 2 (sawtooth) */
        [ 0x22, 0x21, 0x46, 0x89, 0x86, 0x64, 0x55, 0x18, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Lead 3 (calliope) */
        [ 0x21, 0xa1, 0x45, 0x09, 0x66, 0x96, 0x12, 0x0a, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Lead 4 (chiff) */
        [ 0x21, 0x22, 0x8b, 0x09, 0x92, 0x91, 0x2a, 0x2a, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Lead 5 (charang) */
        [ 0xa2, 0x61, 0x9e, 0x49, 0xdf, 0x6f, 0x05, 0x07, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Lead 6 (voice) */
        [ 0x20, 0x60, 0x1a, 0x09, 0xef, 0x8f, 0x01, 0x06, 0x00, 0x02, 0x00, 0, 0, 0 ], /* Lead 7 (fifths) */
        [ 0x21, 0x21, 0x8f, 0x86, 0xf1, 0xf4, 0x29, 0x09, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Lead 8 (bass+lead) */
        [ 0x77, 0xa1, 0xa5, 0x09, 0x53, 0xa0, 0x94, 0x05, 0x00, 0x00, 0x02, 0, 0, 0 ], /* Pad 1 (new age) */
        [ 0x61, 0xb1, 0x1f, 0x89, 0xa8, 0x25, 0x11, 0x03, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Pad 2 (warm) */
        [ 0x61, 0x61, 0x17, 0x09, 0x91, 0x55, 0x34, 0x16, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Pad 3 (polysynth) */
        [ 0x71, 0x72, 0x5d, 0x09, 0x54, 0x6a, 0x01, 0x03, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Pad 4 (choir) */
        [ 0x21, 0xa2, 0x97, 0x09, 0x21, 0x42, 0x43, 0x35, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Pad 5 (bowed) */
        [ 0xa1, 0x21, 0x1c, 0x09, 0xa1, 0x31, 0x77, 0x47, 0x01, 0x01, 0x00, 0, 0, 0 ], /* Pad 6 (metallic) */
        [ 0x21, 0x61, 0x89, 0x0c, 0x11, 0x42, 0x33, 0x25, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Pad 7 (halo) */
        [ 0xa1, 0x21, 0x15, 0x09, 0x11, 0xcf, 0x47, 0x07, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Pad 8 (sweep) */
        [ 0x3a, 0x51, 0xce, 0x09, 0xf8, 0x86, 0xf6, 0x02, 0x00, 0x00, 0x02, 0, 0, 0 ], /* FX 1 (rain) */
        [ 0x21, 0x21, 0x15, 0x09, 0x21, 0x41, 0x23, 0x13, 0x01, 0x00, 0x00, 0, 0, 0 ], /* FX 2 (soundtrack) */
        [ 0x06, 0x01, 0x5b, 0x09, 0x74, 0xa5, 0x95, 0x72, 0x00, 0x00, 0x00, 0, 0, 0 ], /* FX 3 (crystal) */
        [ 0x22, 0x61, 0x92, 0x8c, 0xb1, 0xf2, 0x81, 0x26, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* FX 4 (atmosphere) */
        [ 0x41, 0x42, 0x4d, 0x09, 0xf1, 0xf2, 0x51, 0xf5, 0x01, 0x00, 0x00, 0, 0, 0 ], /* FX 5 (brightness) */
        [ 0x61, 0xa3, 0x94, 0x89, 0x11, 0x11, 0x51, 0x13, 0x01, 0x00, 0x06, 0, 0, 0 ], /* FX 6 (goblins) */
        [ 0x61, 0xa1, 0x8c, 0x89, 0x11, 0x1d, 0x31, 0x03, 0x00, 0x00, 0x06, 0, 0, 0 ], /* FX 7 (echoes) */
        [ 0xa4, 0x61, 0x4c, 0x09, 0xf3, 0x81, 0x73, 0x23, 0x01, 0x00, 0x04, 0, 0, 0 ], /* FX 8 (sci-fi) */
        [ 0x02, 0x07, 0x85, 0x0c, 0xd2, 0xf2, 0x53, 0xf6, 0x00, 0x01, 0x00, 0, 0, 0 ], /* Sitar */
        [ 0x11, 0x13, 0x0c, 0x89, 0xa3, 0xa2, 0x11, 0xe5, 0x01, 0x00, 0x00, 0, 0, 0 ], /* Banjo */
        [ 0x11, 0x11, 0x06, 0x09, 0xf6, 0xf2, 0x41, 0xe6, 0x01, 0x02, 0x04, 0, 0, 0 ], /* Shamisen */
        [ 0x93, 0x91, 0x91, 0x09, 0xd4, 0xeb, 0x32, 0x11, 0x00, 0x01, 0x08, 0, 0, 0 ], /* Koto */
        [ 0x04, 0x01, 0x4f, 0x09, 0xfa, 0xc2, 0x56, 0x05, 0x00, 0x00, 0x0c, 0, 0, 0 ], /* Kalimba */
        [ 0x21, 0x22, 0x49, 0x09, 0x7c, 0x6f, 0x20, 0x0c, 0x00, 0x01, 0x06, 0, 0, 0 ], /* Bagpipe */
        [ 0x31, 0x21, 0x85, 0x09, 0xdd, 0x56, 0x33, 0x16, 0x01, 0x00, 0x0a, 0, 0, 0 ], /* Fiddle */
        [ 0x20, 0x21, 0x04, 0x8a, 0xda, 0x8f, 0x05, 0x0b, 0x02, 0x00, 0x06, 0, 0, 0 ], /* Shanai */
        [ 0x05, 0x03, 0x6a, 0x89, 0xf1, 0xc3, 0xe5, 0xe5, 0x00, 0x00, 0x06, 0, 0, 0 ], /* Tinkle Bell */
        [ 0x07, 0x02, 0x15, 0x09, 0xec, 0xf8, 0x26, 0x16, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Agogo */
        [ 0x05, 0x01, 0x9d, 0x09, 0x67, 0xdf, 0x35, 0x05, 0x00, 0x00, 0x08, 0, 0, 0 ], /* Steel Drums */
        [ 0x18, 0x12, 0x96, 0x09, 0xfa, 0xf8, 0x28, 0xe5, 0x00, 0x00, 0x0a, 0, 0, 0 ], /* Woodblock */
        [ 0x10, 0x00, 0x86, 0x0c, 0xa8, 0xfa, 0x07, 0x03, 0x00, 0x00, 0x06, 0, 0, 0 ], /* Taiko Drum */
        [ 0x11, 0x10, 0x41, 0x0c, 0xf8, 0xf3, 0x47, 0x03, 0x02, 0x00, 0x04, 0, 0, 0 ], /* Melodic Tom */
        [ 0x01, 0x10, 0x8e, 0x09, 0xf1, 0xf3, 0x06, 0x02, 0x02, 0x00, 0x0e, 0, 0, 0 ], /* Synth Drum */
        [ 0x0e, 0xc0, 0x00, 0x09, 0x1f, 0x1f, 0x00, 0xff, 0x00, 0x03, 0x0e, 0, 0, 0 ], /* Reverse Cymbal */
        [ 0x06, 0x03, 0x80, 0x91, 0xf8, 0x56, 0x24, 0x84, 0x00, 0x02, 0x0e, 0, 0, 0 ], /* Guitar Fret Noise */
        [ 0x0e, 0xd0, 0x00, 0x0e, 0xf8, 0x34, 0x00, 0x04, 0x00, 0x03, 0x0e, 0, 0, 0 ], /* Breath Noise */
        [ 0x0e, 0xc0, 0x00, 0x09, 0xf6, 0x1f, 0x00, 0x02, 0x00, 0x03, 0x0e, 0, 0, 0 ], /* Seashore */
        [ 0xd5, 0xda, 0x95, 0x49, 0x37, 0x56, 0xa3, 0x37, 0x00, 0x00, 0x00, 0, 0, 0 ], /* Bird Tweet */
        [ 0x35, 0x14, 0x5c, 0x11, 0xb2, 0xf4, 0x61, 0x15, 0x02, 0x00, 0x0a, 0, 0, 0 ], /* Telephone ring */
        [ 0x0e, 0xd0, 0x00, 0x09, 0xf6, 0x4f, 0x00, 0xf5, 0x00, 0x03, 0x0e, 0, 0, 0 ], /* Helicopter */
        [ 0x26, 0xe4, 0x00, 0x09, 0xff, 0x12, 0x01, 0x16, 0x00, 0x01, 0x0e, 0, 0, 0 ], /* Applause */
        [ 0x00, 0x00, 0x00, 0x09, 0xf3, 0xf6, 0xf0, 0xc9, 0x00, 0x02, 0x0e, 0, 0, 0 ]  /* Gunshot */
    ],
    midi_fm_vol_table: [
        0,  11, 16, 19, 22, 25, 27, 29, 32, 33, 35, 37, 39, 40, 42, 43,
        45, 46, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
        64, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 75, 76, 77,
        78, 79, 80, 80, 81, 82, 83, 83, 84, 85, 86, 86, 87, 88, 89, 89,
        90, 91, 91, 92, 93, 93, 94, 95, 96, 96, 97, 97, 98, 99, 99, 100,
        101, 101, 102, 103, 103, 104, 104, 105, 106, 106, 107, 107, 108,
        109, 109, 110, 110, 111, 112, 112, 113, 113, 114, 114, 115, 115,
        116, 117, 117, 118, 118, 119, 119, 120, 120, 121, 121, 122, 122,
        123, 123, 124, 124, 125, 125, 126, 126, 127
    ]
});

function MidiChannel(){
    this.ins = new Int32Array(11);
}

function MidiTrack(){

}

},{"extend":18}],5:[function(_dereq_,module,exports){
var extend = _dereq_('extend');
var GENMIDI = _dereq_('wad-genmidi');

function MUS(opl, options){
    options = options || {};

    this.opl = opl;
    if (options.instruments && (options.instruments.buffer || options.instruments) instanceof ArrayBuffer) options.instruments = new GENMIDI(options.instruments).instruments;
    this.instruments = options.instruments || _dereq_('./genmidi.json').instruments;
    this.Midi = options.Midi;
    this.onlyMidi = options.onlyMidi || false;
}
module.exports = MUS;

extend(MUS.prototype, {
    op_num: [0x00, 0x01, 0x02, 0x08, 0x09, 0x0A, 0x10, 0x11, 0x12],
    CtrlTranslate: [
        0,	// program change
        0,	// bank select
        1,	// modulation pot
        7,	// volume
        10, // pan pot
        11, // expression pot
        91, // reverb depth
        93, // chorus depth
        64, // sustain pedal
        67, // soft pedal
        120, // all sounds off
        123, // all notes off
        126, // mono
        127, // poly
        121  // reset all controllers
    ],
    MUS: 0x4d55531a,
    CH_SECONDARY: 0x01,
    CH_SUSTAIN: 0x02,
    CH_VIBRATO: 0x04,
    CH_FREE: 0x80,
    OPL2CHANNELS: 9,
    OPL3CHANNELS: 18,
    MUSctrl: {
        ctrlPatch: 0,
        ctrlBank: 1,
        ctrlModulation: 2,
        ctrlVolume: 3,
        ctrlPan: 4,
        ctrlExpression: 5,
        ctrlReverb: 6,
        ctrlChorus: 7,
        ctrlSustainPedal: 8,
        ctrlSoftPedal: 9,
        ctrlRPNHi: 10,
        ctrlRPNLo: 11,
        ctrlNRPNHi: 12,
        ctrlNRPNLo: 13,
        ctrlDataEntryHi: 14,
        ctrlDataEntryLo: 15,
        ctrlSoundsOff: 16,
        ctrlNotesOff: 17,
        ctrlMono: 18,
        ctrlPoly: 19
    },
    MIDItoOPLctrl: {
        0: 1,
        1: 2,
        6: 14,
        7: 3,
        10: 4,
        11: 5,
        38: 15,
        64: 8,
        67: 9,
        91: 6,
        93: 7,
        98: 13,
        99: 12,
        100: 11,
        101: 10,
        120: 16,
        123: 17,
        126: 18,
        127: 19
    },
    PERCUSSION: 15,
    MOD_MIN: 40,
    load: function(buffer){
        this.data = new DataView(buffer.buffer || buffer);

        if (this.data.getInt32(0) != this.MUS) throw new Error('Buffer is not a MUS file');
        this.scoreLength = this.data.getUint16(4, true);
        this.scoreStart = this.data.getUint16(6, true);
        this.channelCount = this.data.getUint16(8, true);
        this.secondaryChannels = this.data.getUint16(10, true);
        this.instrumentsCount = this.data.getUint16(12, true);
        
        this.channelInstruments = [];
        for (var i = 0, j = 16; i < this.instrumentsCount; i++, j += 2){
            this.channelInstruments.push(this.data.getUint16(j, true));
        }

        this.channels = [];
        this.OPLchannels = this.OPL3CHANNELS;
        for (var i = 0; i < this.OPLchannels; i++){
            this.channels[i] = {};
        }

        this.position = 0;

        this.voices = [];
        for (var i = 0; i < this.OPLchannels; i++){
            this.voices[i] = {
                channel: -1,
                note: 0,
                flags: 0,
                realnote: 0,
                finetune: 0,
                pitch: 0,
                volume: 0,
                realvolume: 0,
                instr: null,
                time: 0
            };
        }

        this.driverdata = {
            channelInstr: new Uint32Array(this.OPLchannels),
            channelVolume: new Uint8Array(this.OPLchannels),
            channelLastVolume: new Uint8Array(this.OPLchannels),
            channelPan: new Int8Array(this.OPLchannels),
            channelPitch: new Int8Array(this.OPLchannels),
            channelSustain: new Uint8Array(this.OPLchannels),
            channelModulation: new Uint8Array(this.OPLchannels),
            channelPitchSens: new Uint16Array(this.OPLchannels),
            channelRPN: new Uint16Array(this.OPLchannels),
            channelExpression: new Uint8Array(this.OPLchannels)
        };

        this.rewind();
    },
    update: function(){
        if (this.position >= this.data.byteLength){
            return false;
        }

        var last = 0;
        while (!last){
            var deltaTime = this.deltaTime;
            var event = this.data.getUint8(this.position++);
            var channel = event & 0xf;
            var type = (event & 0x70) >> 4;
            last = event & 0x80;
            
            var midiChannel = channel;
            if (midiChannel == 15) midiChannel = 9;
	        else if (midiChannel >= 9) midiChannel++;
            
            if (this.midiTrack){
                if (!this.chanUsed[channel]){
                    this.chanUsed[channel] = true;
                    
                    this.midiTrack.addEvent(new (this.Midi.Event)({
                        type: this.Midi.Event.CONTROLLER,
                        channel: midiChannel,
                        param1: 7,
                        param2: 127
                    }));
                }
            }
            
            switch (type){
                case 0: //release note
                    var note = this.data.getUint8(this.position++) & 0x7f;
                    this.playingcount--;
                    this.OPLreleaseNote(channel, note);
                    if (this.midiTrack){
                        this.midiTrack.noteOff(midiChannel, note, deltaTime);
                    }
                    break;
                case 1: //play note
                    var data = this.data.getUint8(this.position++);
                    var note = data & 0x7f;
                    var volume = this.driverdata.channelLastVolume[channel];
                    if (data & 0x80){
                        volume = this.data.getUint8(this.position++) & 0x7f;
                    }
                    
                    this.playingcount++;
                    this.OPLplayNote(channel, note, volume);
                    if (this.midiTrack){
                        this.midiTrack.noteOn(midiChannel, note, deltaTime, volume);
                    }
                    break;
                case 2: //pitch wheel
                    var pitch = this.data.getUint8(this.position++);
                    this.OPLpitchWheel(channel, ((pitch & 1) << 6) | (((pitch >> 1) & 127) << 7));
                    if (this.midiTrack){
                        this.midiTrack.addEvent(new (this.Midi.Event)({
                            type: this.Midi.Event.PITCH_BEND,
                            channel: midiChannel,
                            param1: (pitch & 1) << 6,
                            param2: (pitch >> 1) & 127,
                            time: deltaTime
                        }));
                    }
                    break;
                case 3: //system event
                    var number = this.data.getUint8(this.position++) & 0x7f;
                    if (number < 10 || number > 14){
                        // no_op
                    }else if (this.midiTrack){
                        this.midiTrack.addEvent(new (this.Midi.Event)({
                            type: this.Midi.Event.CONTROLLER,
                            channel: midiChannel,
                            param1: this.CtrlTranslate[number],
                            param2: number == 12 ? this.channelCount : 0,
                            time: deltaTime
                        }));
                    }
                    break;
                case 4: //change controller
                    var ctrl = this.data.getUint8(this.position++) & 0x7f;
                    var value = this.data.getUint8(this.position++) & 0x7f;
                    if (ctrl == 0){
                        this.OPLprogramChange(channel, value);
                        if (this.midiTrack){
                            this.midiTrack.instrument(midiChannel, value, deltaTime);
                        }
                    }else{
                        if (this.CtrlTranslate[ctrl] == 121) this.OPLresetControllers(channel, 100);
                        else this.OPLchangeControl(channel, this.MIDItoOPLctrl[this.CtrlTranslate[ctrl]], value);
                        if (this.midiTrack && ctrl > 0 && ctrl < 10){
                            this.midiTrack.addEvent(new (this.Midi.Event)({
                                type: this.Midi.Event.CONTROLLER,
                                channel: midiChannel,
                                param1: this.CtrlTranslate[ctrl],
                                param2: value,
                                time: deltaTime
                            }));
                        }
                    }
                    break;
                case 6: //score end
                    this.OPLstopMusic();
                    this.OPLshutup();
                    if (this.midiTrack){
                        this.midiTrack.addEvent(new (this.Midi.MetaEvent)({
                            type: this.Midi.MetaEvent.END_OF_TRACK
                        }));
                        
                        this.midiBuffer = this.midiFile.toBytes();
                    }
                    
                    this.rewind();
                    return false;
            }

            var time = 0;
            if (event & 0x80){
                while (true){
                    var byte = this.data.getUint8(this.position++);
                    time = time * 128 + (byte & 0x7f);
                    if (!(byte & 0x80)) break;
                }

                this.deltaTime = time;
                this.MLtime += time;
            }else this.deltaTime = 0;
        }
        
        this.wait = time * 1 / 140;
        return true;
    },
    refresh: function(){
        return this.wait;
    },
    rewind: function(){
        if (this.Midi){
            this.midiFile = new this.Midi.File();
            this.midiTrack = new this.Midi.Track();
            this.midiFile.addTrack(this.midiTrack);
            
            this.midiTrack.setTempo(65);
            this.chanUsed = [];
        }
        
        this.position = this.scoreStart;
        this.deltaTime = 0;
        this.playingcount = 0;
        this.MLtime = 0;
        this.OPLinit();
        this.OPLstopMusic();
        this.OPLplayMusic(127);
    },
    writeFrequency: function(slot, note, pitch, keyon){
        this.OPLwriteFreq(slot, note, pitch, keyon);
    },
    writeModulation: function(slot, instr, state){
        if (state) state = 0x40;
        this.OPLwriteChannel(0x20, slot, (instr.feedback & 1)
            ? (instr.modulatorTremolo | state) : instr.modulatorTremolo,
		    instr.carrierTremolo | state);
    },
    calcVolume: function(channelVolume, channelExpression, noteVolume){
        noteVolume = ((channelVolume * channelExpression * noteVolume) / (127 * 127)) | 0;
        return (noteVolume > 127) ? 127 : noteVolume;
    },
    occupyChannel: function(slot, channel, note, volume, instrument, secondary){
        var instr;
        var ch = this.channels[slot];

        ch.channel = channel;
        ch.note = note;
        ch.flags = secondary ? this.CH_SECONDARY : 0;
        if (this.driverdata.channelModulation[channel] >= this.MOD_MIN) ch.flags |= this.CH_VIBRATO;
        ch.time = this.MLtime;
        if (volume == -1) volume = this.driverdata.channelLastVolume[channel];
        else this.driverdata.channelLastVolume[channel] = volume;

        ch.realvolume = this.calcVolume(this.driverdata.channelVolume[channel], this.driverdata.channelExpression[channel], ch.volume = volume);
        if (instrument.fixedPitch) note = instrument.fixedNote;
        else if (channel == this.PERCUSSION) note = 60; // C-5
        if (secondary && (instrument.doubleVoice)) ch.finetune = (instrument.fineTuning - 0x80) >> 1;
        else ch.finetune = 0;
        ch.pitch = ch.finetune + this.driverdata.channelPitch[channel];
        if (secondary) instr = instrument.voices[1];
        else instr = instrument.voices[0];
        ch.instr = instr;
        if (channel != this.PERCUSSION && !(instrument.fixedPitch)){
            if ((note += instr.baseNoteOffset) < 0){
                while ((note += 12) < 0){}
            }else if (note > this.HIGHEST_NOTE){
                while ((note -= 12) > this.HIGHEST_NOTE){}
            }
        }
        ch.realnote = note;

        this.OPLwriteInstrument(slot, instr);
        if (ch.flags & this.CH_VIBRATO) this.writeModulation(slot, instr, 1);
        this.OPLwritePan(slot, instr, this.driverdata.channelPan[channel]);
        this.OPLwriteVolume(slot, instr, ch.realvolume);
        this.writeFrequency(slot, note, ch.pitch, 1);

        return slot;
    },
    releaseChannel: function(slot, killed){
        var ch = this.channels[slot];
        this.writeFrequency(slot, ch.realnote, ch.pitch, 0);
        ch.channel |= this.CH_FREE;
        ch.time = this.MLtime;
        ch.flags = this.CH_FREE;
        if (killed){
            this.OPLwriteChannel(0x80, slot, 0x0f, 0x0f);  // release rate - fastest
            this.OPLwriteChannel(0x40, slot, 0x3f, 0x3f);  // no volume
        }
        return slot;
    },
    releaseSustain: function(channel){
        for (var i = 0; i < this.OPLchannels; i++){
            if (this.channels[i].channel == channel && this.channels[i].flags & this.CH_SUSTAIN){
                this.releaseChannel(i, 0);
            }
        }
        return 0;
    },
    findFreeChannel: function(flag, channel, note){
        var last = -1;
        var oldest = -1;
        var oldesttime = this.MLtime;
        var bestvoice = 0;

        for (var i = 0; i < this.OPLchannels; ++i){
            if (++last == this.OPLchannels)	/* use cyclic `Next Fit' algorithm */
                last = 0;
            if (this.channels[last].flags & this.CH_FREE)
                return last;
        }

        if (flag & 1){ // No free channels good enough
            return -1;
        }

        /* find some 2nd-voice channel and determine the oldest */
        for(var i = 0; i < this.OPLchannels; i++){
            if (this.channels[i].flags & this.CH_SECONDARY){
                this.releaseChannel(i, 1);
                return i;
            }else if (this.channels[i].time < oldesttime){
                oldesttime = this.channels[i].time;
                oldest = i;
            }
        }

        /* if possible, kill the oldest channel */
        if (!(flag & 2) && oldest != -1){
            this.releaseChannel(oldest, 1);
            return oldest;
        }

        /* can't find any free channel */
        return -1;
    },
    getInstrument: function(channel, note){
        var instrnumber;

        if (channel == this.PERCUSSION){
            if (note < 35 || note > 81) return null; /* wrong percussion number */
            instrnumber = note + (128 - 35);
        }else{
            instrnumber = this.driverdata.channelInstr[channel];
        }

        return this.instruments[instrnumber] || null;
    },
    OPLplayNote: function(channel, note, volume){
        if (volume == 0) return this.OPLreleaseNote(channel, note);

        var instr = this.getInstrument(channel, note);
        if (!instr) return;

        var i = this.findFreeChannel((channel == this.PERCUSSION) ? 2 : 0, channel, note);
        if (i >= 0){
            this.occupyChannel(i, channel, note, volume, instr, 0);
            if (instr.doubleVoice){
                i = this.findFreeChannel((channel == this.PERCUSSION) ? 3 : 1, channel, note);
                if (i >= 0){
                    this.occupyChannel(i, channel, note, volume, instr, 1);
                }
            }
        }
    },
	OPLreleaseNote: function(channel, note){
        var sustain = this.driverdata.channelSustain[channel];

        for (var i = 0; i < this.OPLchannels; i++){
            if (this.channels[i].channel == channel && this.channels[i].note == note){
                if (sustain < 0x40) this.releaseChannel(i, 0);
                else this.channels[i].flags |= this.CH_SUSTAIN;
            }
        }
    },
	OPLpitchWheel: function(channel, pitch){
        // Convert pitch from 14-bit to 7-bit, then scale it, since the player
        // code only understands sensitivities of 2 semitones.
        pitch = ((pitch - 8192) * this.driverdata.channelPitchSens[channel] / (200 * 128) + 64) | 0;
        this.driverdata.channelPitch[channel] = pitch;
        for (var i = 0; i < this.OPLchannels; i++){
            var ch = this.channels[i];
            if (ch.channel == channel){
                ch.time = this.MLtime;
                ch.pitch = ch.finetune + pitch;
                this.writeFrequency(i, ch.realnote, ch.pitch, 1);
            }
        }
    },
	OPLchangeControl: function(channel, controller, value){
        switch (controller){
            case this.MUSctrl.ctrlPatch:			/* change instrument */
                this.OPLprogramChange(channel, value);
                break;

            case this.MUSctrl.ctrlModulation:
                this.driverdata.channelModulation[channel] = value;
                for (var i = 0; i < this.OPLchannels; i++){
                    var ch = this.channels[i];
                    if (ch.channel == channel){
                        var flags = ch.flags;
                        ch.time = this.MLtime;
                        if (value >= this.MOD_MIN){
                            ch.flags |= this.CH_VIBRATO;
                            if (ch.flags != flags) this.writeModulation(i, ch.instr, 1);
                        }else{
                            ch.flags &= ~this.CH_VIBRATO;
                            if (ch.flags != flags) this.writeModulation(i, ch.instr, 0);
                        }
                    }
                }
                break;
            case this.MUSctrl.ctrlVolume:		/* change volume */
                this.driverdata.channelVolume[channel] = value;
                /* fall-through */
            case this.MUSctrl.ctrlExpression:	/* change expression */
                if (controller == this.MUSctrl.ctrlExpression){
                    this.driverdata.channelExpression[channel] = value;
                }

                for (var i = 0; i < this.OPLchannels; i++){
                    var ch = this.channels[i];
                    if (ch.channel == channel){
                        ch.time = this.MLtime;
                        ch.realvolume = this.calcVolume(this.driverdata.channelVolume[channel],
                            this.driverdata.channelExpression[channel], ch.volume);
                        this.OPLwriteVolume(i, ch.instr, ch.realvolume);
                    }
                }
                break;

            case this.MUSctrl.ctrlPan:			/* change pan (balance) */
                this.driverdata.channelPan[channel] = value -= 64;
                for (var i = 0; i < this.OPLchannels; i++){
                    var ch = this.channels[i];
                    if (ch.channel == channel){
                        ch.time = this.MLtime;
                        this.OPLwritePan(i, ch.instr, value);
                    }
                }
                break;
            case this.MUSctrl.ctrlSustainPedal:		/* change sustain pedal (hold) */
                this.driverdata.channelSustain[channel] = value;
                if (value < 0x40) this.releaseSustain(channel);
                break;
            case this.MUSctrl.ctrlNotesOff:			/* turn off all notes that are not sustained */
                for (var i = 0; i < this.OPLchannels; ++i){
                    if (this.channels[i].channel == channel){
                        if (this.driverdata.channelSustain[channel] < 0x40) this.releaseChannel(i, 0);
                        else this.channels[i].flags |= this.CH_SUSTAIN;
                    }
                }
                break;
            case this.MUSctrl.ctrlSoundsOff:			/* release all notes for this channel */
                for (var i = 0; i < this.OPLchannels; ++i){
                    if (this.channels[i].channel == channel){
                        this.releaseChannel(i, 0);
                    }
                }
                break;
            case this.MUSctrl.ctrlRPNHi:
                this.driverdata.channelRPN[channel] = (this.driverdata.channelRPN[channel] & 0x007f) | (value << 7);
                break;
            case this.MUSctrl.ctrlRPNLo:
                this.driverdata.channelRPN[channel] = (this.driverdata.channelRPN[channel] & 0x3f80) | value;
                break;
            case this.MUSctrl.ctrlNRPNLo:
            case this.MUSctrl.ctrlNRPNHi:
                this.driverdata.channelRPN[channel] = 0x3fff;
                break;
            case this.MUSctrl.ctrlDataEntryHi:
                if (this.driverdata.channelRPN[channel] == 0){
                    this.driverdata.channelPitchSens[channel] = value * 100 + (this.driverdata.channelPitchSens[channel] % 100);
                }
                break;
            case this.MUSctrl.ctrlDataEntryLo:
                if (this.driverdata.channelRPN[channel] == 0){
                    this.driverdata.channelPitchSens[channel] = value + Math.floor(this.driverdata.channelPitchSens[channel] / 100) * 100;
                }
                break;
        }
    },
	OPLprogramChange: function(channel, value){
        this.driverdata.channelInstr[channel] = value;
    },
	OPLresetControllers: function(chan, vol){
        this.driverdata.channelVolume[chan] = vol;
        this.driverdata.channelExpression[chan] = 127;
        this.driverdata.channelSustain[chan] = 0;
        this.driverdata.channelLastVolume[chan] = 64;
        this.driverdata.channelPitch[chan] = 64;
        this.driverdata.channelRPN[chan] = 0x3fff;
        this.driverdata.channelPitchSens[chan] = 200;
    },
	OPLplayMusic: function(vol){
        for (var i = 0; i < this.OPL3CHANNELS; i++){
            this.OPLresetControllers(i, vol);
        }
    },
	OPLstopMusic: function(){
        for (var i = 0; i < this.OPLchannels; i++){
            if (!(this.channels[i].flags & this.CH_FREE)){
                this.releaseChannel(i, 1);
            }
        }
    },
	OPLloadBank: function(data){},
    OPLwriteChannel: function(regbase, channel, data1, data2){
        var which = (channel / this.OPL2CHANNELS) | 0;
        var reg = regbase + this.op_num[channel % this.OPL2CHANNELS];
        this.OPLwriteReg(which, reg, data1);
        this.OPLwriteReg(which, reg + 3, data2);
    },
	OPLwriteValue: function(regbase, channel, value){
        var which = (channel / this.OPL2CHANNELS) | 0;
        var reg = regbase + (channel % this.OPL2CHANNELS);
        this.OPLwriteReg(which, reg, value);
    },
	OPLwriteFreq: function(channel, note, pitch, keyon){
        var octave = 0;
        var j = (note << 5) + pitch;

        if (j < 0) j = 0;
        else if (j >= 284){
            j -= 284;
            octave = (j / (32 * 12)) | 0;
            if (octave > 7) octave = 7;
            j = (j % (32 * 12)) + 284;
        }
        var i = this.frequencies[j] | (octave << 10);

        this.OPLwriteValue(0xa0, channel, i & 0xff);
        this.OPLwriteValue(0xb0, channel, (i >> 8) | (keyon << 5));
    },
	OPLconvertVolume: function(data, volume){
        return 0x3f - (((0x3f - data) * this.volumetable[volume <= 127 ? volume : 127]) >> 7);
    },
	OPLpanVolume: function(volume, pan){
        return pan >= 0 ? volume : ((volume * (pan + 64)) / 64) | 0;
    },
	OPLwriteVolume: function(channel, instr, volume){
        if (instr){
            this.OPLwriteChannel(0x40, channel, ((instr.feedback & 1) ?
                this.OPLconvertVolume(instr.modulatorOutput, volume) : instr.modulatorOutput) | instr.modulatorKey,
                this.OPLconvertVolume(instr.carrierOutput, volume) | instr.carrierKey);
        }
    },
	OPLwritePan: function(channel, instr, pan){
        if (instr){
            var bits;
            if (pan < -36) bits = 0x10;
            else if (pan > 36) bits = 0x20;
            else bits = 0x30;

            this.OPLwriteValue(0xc0, channel, instr.feedback | bits);
        }
    },
	OPLwriteInstrument: function(channel, instr){
        this.OPLwriteChannel(0x40, channel, 0x3f, 0x3f); //no volume
        this.OPLwriteChannel(0x20, channel, instr.modulatorTremolo, instr.carrierTremolo);
        this.OPLwriteChannel(0x60, channel, instr.modulatorAttack, instr.carrierAttack);
        this.OPLwriteChannel(0x80, channel, instr.modulatorSustain, instr.carrierSustain);
        this.OPLwriteChannel(0xe0, channel, instr.modulatorWaveform, instr.carrierWaveform);
        this.OPLwriteValue(0xc0, channel, instr.feedback | 0x30);
    },
	OPLshutup: function(){
        for(i = 0; i < this.OPL3CHANNELS; i++){
            this.OPLwriteChannel(0x40, i, 0x3f, 0x3f);	// turn off volume
            this.OPLwriteChannel(0x60, i, 0xff, 0xff);	// the fastest attack, decay
            this.OPLwriteChannel(0x80, i, 0x0f, 0x0f);	// ... and release
            this.OPLwriteValue(0xb0, i, 0);		// KEY-OFF
        }
    },
	OPLwriteInitState: function(initopl3){
        this.OPLwriteReg(1, 0x105, 0x01);	// enable YMF262/OPL3 mode
        this.OPLwriteReg(1, 0x104, 0x00);	// disable 4-operator mode
        this.OPLwriteReg(0, 0x01, 0x20);	// enable Waveform Select
		this.OPLwriteReg(0, 0x08, 0x40);	// turn off CSW mode
		this.OPLwriteReg(0, 0xbd, 0x00);	// set vibrato/tremolo depth to low, set melodic mode
        this.OPLshutup();
    },
	OPLinit: function(numchips, stereo, initopl3){
        this.OPLwriteInitState(true);
    },
	OPLdeinit: function(){},
	OPLwriteReg: function(which, reg, data){
        if (this.onlyMidi) return;
        if (which == 1 && reg > 0x100) reg -= 0x100
        this.opl.write(which, reg, data);
    },
    volumetable: [
        0, 1, 3, 5, 6, 8, 10, 11,
        13, 14, 16, 17, 19, 20, 22, 23,
        25, 26, 27, 29, 30, 32, 33, 34,
        36, 37, 39, 41, 43, 45, 47, 49,
        50, 52, 54, 55, 57, 59, 60, 61,
        63, 64, 66, 67, 68, 69, 71, 72,
        73, 74, 75, 76, 77, 79, 80, 81,
        82, 83, 84, 84, 85, 86, 87, 88,
        89, 90, 91, 92, 92, 93, 94, 95,
        96, 96, 97, 98, 99, 99, 100, 101,
        101, 102, 103, 103, 104, 105, 105, 106,
        107, 107, 108, 109, 109, 110, 110, 111,
        112, 112, 113, 113, 114, 114, 115, 115,
        116, 117, 117, 118, 118, 119, 119, 120,
        120, 121, 121, 122, 122, 123, 123, 123,
        124, 124, 125, 125, 126, 126, 127, 127
    ],
    frequencies: [
        0x133, 0x133, 0x134, 0x134, 0x135, 0x136, 0x136, 0x137,   // -1
        0x137, 0x138, 0x138, 0x139, 0x139, 0x13a, 0x13b, 0x13b,
        0x13c, 0x13c, 0x13d, 0x13d, 0x13e, 0x13f, 0x13f, 0x140,
        0x140, 0x141, 0x142, 0x142, 0x143, 0x143, 0x144, 0x144,

        0x145, 0x146, 0x146, 0x147, 0x147, 0x148, 0x149, 0x149,   // -2
        0x14a, 0x14a, 0x14b, 0x14c, 0x14c, 0x14d, 0x14d, 0x14e,
        0x14f, 0x14f, 0x150, 0x150, 0x151, 0x152, 0x152, 0x153,
        0x153, 0x154, 0x155, 0x155, 0x156, 0x157, 0x157, 0x158,

        // These are used for the first seven MIDI note values:

        0x158, 0x159, 0x15a, 0x15a, 0x15b, 0x15b, 0x15c, 0x15d,   // 0
        0x15d, 0x15e, 0x15f, 0x15f, 0x160, 0x161, 0x161, 0x162,
        0x162, 0x163, 0x164, 0x164, 0x165, 0x166, 0x166, 0x167,
        0x168, 0x168, 0x169, 0x16a, 0x16a, 0x16b, 0x16c, 0x16c,

        0x16d, 0x16e, 0x16e, 0x16f, 0x170, 0x170, 0x171, 0x172,   // 1
        0x172, 0x173, 0x174, 0x174, 0x175, 0x176, 0x176, 0x177,
        0x178, 0x178, 0x179, 0x17a, 0x17a, 0x17b, 0x17c, 0x17c,
        0x17d, 0x17e, 0x17e, 0x17f, 0x180, 0x181, 0x181, 0x182,

        0x183, 0x183, 0x184, 0x185, 0x185, 0x186, 0x187, 0x188,   // 2
        0x188, 0x189, 0x18a, 0x18a, 0x18b, 0x18c, 0x18d, 0x18d,
        0x18e, 0x18f, 0x18f, 0x190, 0x191, 0x192, 0x192, 0x193,
        0x194, 0x194, 0x195, 0x196, 0x197, 0x197, 0x198, 0x199,

        0x19a, 0x19a, 0x19b, 0x19c, 0x19d, 0x19d, 0x19e, 0x19f,   // 3
        0x1a0, 0x1a0, 0x1a1, 0x1a2, 0x1a3, 0x1a3, 0x1a4, 0x1a5,
        0x1a6, 0x1a6, 0x1a7, 0x1a8, 0x1a9, 0x1a9, 0x1aa, 0x1ab,
        0x1ac, 0x1ad, 0x1ad, 0x1ae, 0x1af, 0x1b0, 0x1b0, 0x1b1,

        0x1b2, 0x1b3, 0x1b4, 0x1b4, 0x1b5, 0x1b6, 0x1b7, 0x1b8,   // 4
        0x1b8, 0x1b9, 0x1ba, 0x1bb, 0x1bc, 0x1bc, 0x1bd, 0x1be,
        0x1bf, 0x1c0, 0x1c0, 0x1c1, 0x1c2, 0x1c3, 0x1c4, 0x1c4,
        0x1c5, 0x1c6, 0x1c7, 0x1c8, 0x1c9, 0x1c9, 0x1ca, 0x1cb,

        0x1cc, 0x1cd, 0x1ce, 0x1ce, 0x1cf, 0x1d0, 0x1d1, 0x1d2,   // 5
        0x1d3, 0x1d3, 0x1d4, 0x1d5, 0x1d6, 0x1d7, 0x1d8, 0x1d8,
        0x1d9, 0x1da, 0x1db, 0x1dc, 0x1dd, 0x1de, 0x1de, 0x1df,
        0x1e0, 0x1e1, 0x1e2, 0x1e3, 0x1e4, 0x1e5, 0x1e5, 0x1e6,

        0x1e7, 0x1e8, 0x1e9, 0x1ea, 0x1eb, 0x1ec, 0x1ed, 0x1ed,   // 6
        0x1ee, 0x1ef, 0x1f0, 0x1f1, 0x1f2, 0x1f3, 0x1f4, 0x1f5,
        0x1f6, 0x1f6, 0x1f7, 0x1f8, 0x1f9, 0x1fa, 0x1fb, 0x1fc,
        0x1fd, 0x1fe, 0x1ff, 0x200, 0x201, 0x201, 0x202, 0x203,

        // First note of looped range used for all octaves:

        0x204, 0x205, 0x206, 0x207, 0x208, 0x209, 0x20a, 0x20b,   // 7
        0x20c, 0x20d, 0x20e, 0x20f, 0x210, 0x210, 0x211, 0x212,
        0x213, 0x214, 0x215, 0x216, 0x217, 0x218, 0x219, 0x21a,
        0x21b, 0x21c, 0x21d, 0x21e, 0x21f, 0x220, 0x221, 0x222,

        0x223, 0x224, 0x225, 0x226, 0x227, 0x228, 0x229, 0x22a,   // 8
        0x22b, 0x22c, 0x22d, 0x22e, 0x22f, 0x230, 0x231, 0x232,
        0x233, 0x234, 0x235, 0x236, 0x237, 0x238, 0x239, 0x23a,
        0x23b, 0x23c, 0x23d, 0x23e, 0x23f, 0x240, 0x241, 0x242,

        0x244, 0x245, 0x246, 0x247, 0x248, 0x249, 0x24a, 0x24b,   // 9
        0x24c, 0x24d, 0x24e, 0x24f, 0x250, 0x251, 0x252, 0x253,
        0x254, 0x256, 0x257, 0x258, 0x259, 0x25a, 0x25b, 0x25c,
        0x25d, 0x25e, 0x25f, 0x260, 0x262, 0x263, 0x264, 0x265,

        0x266, 0x267, 0x268, 0x269, 0x26a, 0x26c, 0x26d, 0x26e,   // 10
        0x26f, 0x270, 0x271, 0x272, 0x273, 0x275, 0x276, 0x277,
        0x278, 0x279, 0x27a, 0x27b, 0x27d, 0x27e, 0x27f, 0x280,
        0x281, 0x282, 0x284, 0x285, 0x286, 0x287, 0x288, 0x289,

        0x28b, 0x28c, 0x28d, 0x28e, 0x28f, 0x290, 0x292, 0x293,   // 11
        0x294, 0x295, 0x296, 0x298, 0x299, 0x29a, 0x29b, 0x29c,
        0x29e, 0x29f, 0x2a0, 0x2a1, 0x2a2, 0x2a4, 0x2a5, 0x2a6,
        0x2a7, 0x2a9, 0x2aa, 0x2ab, 0x2ac, 0x2ae, 0x2af, 0x2b0,

        0x2b1, 0x2b2, 0x2b4, 0x2b5, 0x2b6, 0x2b7, 0x2b9, 0x2ba,   // 12
        0x2bb, 0x2bd, 0x2be, 0x2bf, 0x2c0, 0x2c2, 0x2c3, 0x2c4,
        0x2c5, 0x2c7, 0x2c8, 0x2c9, 0x2cb, 0x2cc, 0x2cd, 0x2ce,
        0x2d0, 0x2d1, 0x2d2, 0x2d4, 0x2d5, 0x2d6, 0x2d8, 0x2d9,

        0x2da, 0x2dc, 0x2dd, 0x2de, 0x2e0, 0x2e1, 0x2e2, 0x2e4,   // 13
        0x2e5, 0x2e6, 0x2e8, 0x2e9, 0x2ea, 0x2ec, 0x2ed, 0x2ee,
        0x2f0, 0x2f1, 0x2f2, 0x2f4, 0x2f5, 0x2f6, 0x2f8, 0x2f9,
        0x2fb, 0x2fc, 0x2fd, 0x2ff, 0x300, 0x302, 0x303, 0x304,

        0x306, 0x307, 0x309, 0x30a, 0x30b, 0x30d, 0x30e, 0x310,   // 14
        0x311, 0x312, 0x314, 0x315, 0x317, 0x318, 0x31a, 0x31b,
        0x31c, 0x31e, 0x31f, 0x321, 0x322, 0x324, 0x325, 0x327,
        0x328, 0x329, 0x32b, 0x32c, 0x32e, 0x32f, 0x331, 0x332,

        0x334, 0x335, 0x337, 0x338, 0x33a, 0x33b, 0x33d, 0x33e,   // 15
        0x340, 0x341, 0x343, 0x344, 0x346, 0x347, 0x349, 0x34a,
        0x34c, 0x34d, 0x34f, 0x350, 0x352, 0x353, 0x355, 0x357,
        0x358, 0x35a, 0x35b, 0x35d, 0x35e, 0x360, 0x361, 0x363,

        0x365, 0x366, 0x368, 0x369, 0x36b, 0x36c, 0x36e, 0x370,   // 16
        0x371, 0x373, 0x374, 0x376, 0x378, 0x379, 0x37b, 0x37c,
        0x37e, 0x380, 0x381, 0x383, 0x384, 0x386, 0x388, 0x389,
        0x38b, 0x38d, 0x38e, 0x390, 0x392, 0x393, 0x395, 0x397,

        0x398, 0x39a, 0x39c, 0x39d, 0x39f, 0x3a1, 0x3a2, 0x3a4,   // 17
        0x3a6, 0x3a7, 0x3a9, 0x3ab, 0x3ac, 0x3ae, 0x3b0, 0x3b1,
        0x3b3, 0x3b5, 0x3b7, 0x3b8, 0x3ba, 0x3bc, 0x3bd, 0x3bf,
        0x3c1, 0x3c3, 0x3c4, 0x3c6, 0x3c8, 0x3ca, 0x3cb, 0x3cd,

        // The last note has an incomplete range, and loops round back to
        // the start.  Note that the last value is actually a buffer overrun
        // and does not fit with the other values.

        0x3cf, 0x3d1, 0x3d2, 0x3d4, 0x3d6, 0x3d8, 0x3da, 0x3db,   // 18
        0x3dd, 0x3df, 0x3e1, 0x3e3, 0x3e4, 0x3e6, 0x3e8, 0x3ea,
        0x3ec, 0x3ed, 0x3ef, 0x3f1, 0x3f3, 0x3f5, 0x3f6, 0x3f8,
        0x3fa, 0x3fc, 0x3fe, 0x36c
    ]
});
},{"./genmidi.json":2,"extend":18,"wad-genmidi":47}],6:[function(_dereq_,module,exports){
(function (Buffer){
var extend = _dereq_('extend');

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
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":13,"extend":18}],7:[function(_dereq_,module,exports){
module.exports = {
    OPL3: _dereq_('./lib/opl3'),
    format: {
        LAA: _dereq_('./format/laa'),
        MUS: _dereq_('./format/mus'),
        DRO: _dereq_('./format/dro'),
        IMF: _dereq_('./format/imf'),
        RAW: _dereq_('./format/raw')
    },
    WAV: _dereq_('wav-arraybuffer'),
    ConvertTo32Bit: _dereq_('pcm-bitdepth-converter').From16To32Bit,
    Normalizer: _dereq_('pcm-normalizer'),
    Player: _dereq_('./lib/player')
};
},{"./format/dro":1,"./format/imf":3,"./format/laa":4,"./format/mus":5,"./format/raw":6,"./lib/opl3":8,"./lib/player":9,"pcm-bitdepth-converter":22,"pcm-normalizer":23,"wav-arraybuffer":48}],8:[function(_dereq_,module,exports){
var util = _dereq_('util');
var extend = _dereq_('extend');

function OPL3(){
    this.nts = 0;
    this.dam = 0;
    this.dvb = 0;
    this.ryt = 0;
    this.bd = 0;
    this.sd = 0;
    this.tom = 0;
    this.tc = 0;
    this.hh = 0;
    this._new = 0;
    this.connectionsel = 0;
    this.vibratoIndex = 0;
    this.tremoloIndex = 0;

    this.registers = new Int32Array(0x200);
    this.channels = [new Array(9), new Array(9)];

    this.initOperators();
    this.initChannels2op();
    this.initChannels4op();
    this.initRhythmChannels();
    this.initChannels();

    this.output = new Int16Array(2);
    this.outputBuffer = new Float64Array(4);
    this.outputChannelNumber = 2;
}
module.exports = OPL3;

extend(OPL3.prototype, {
    read: function(output, seek){
        var offset = seek || 0;
        output = output || this.output;
        var converterScale = output instanceof Float32Array ? 32768 : 1;

        do{
            var channelOutput, outputChannelNumber;

            for (outputChannelNumber = 0; outputChannelNumber < 4; outputChannelNumber++){
                this.outputBuffer[outputChannelNumber] = 0;
            }

            // If _new = 0, use OPL2 mode with 9 channels. If _new = 1, use OPL3 18 channels;
            for (var array = 0; array < (this._new + 1); array++){
                for (var channelNumber = 0; channelNumber < 9; channelNumber++){
                    // Reads output from each OPL3 channel, and accumulates it in the output buffer:
                    channelOutput = this.channels[array][channelNumber].getChannelOutput();
                    for (outputChannelNumber = 0; outputChannelNumber < 4; outputChannelNumber++){
                        this.outputBuffer[outputChannelNumber] += channelOutput[outputChannelNumber];
                    }
                }
            }

            // Normalizes the output buffer after all channels have been added,
            // with a maximum of 18 channels,
            // and multiplies it to get the 16 bit signed output.
            for (outputChannelNumber = 0; outputChannelNumber < this.outputChannelNumber; outputChannelNumber++){
                output[offset + outputChannelNumber] = ((this.outputBuffer[outputChannelNumber] / 18) * 0x7FFF) / converterScale;
            }

            // Advances the OPL3-wide vibrato index, which is used by
            // PhaseGenerator.getPhase() in each Operator.
            this.vibratoIndex++;
            if (this.vibratoIndex >= OPL3Data.vibratoTable[this.dvb].length) this.vibratoIndex = 0;
            // Advances the OPL3-wide tremolo index, which is used by
            // EnvelopeGenerator.getEnvelope() in each Operator.
            this.tremoloIndex++;
            if (this.tremoloIndex >= OPL3Data.tremoloTable[this.dam].length) this.tremoloIndex = 0;

            offset += this.outputChannelNumber;
        }while (offset < output.length);

        return output;
    },
    write: function(array, address, data){
        // The OPL3 has two registers arrays, each with adresses ranging
        // from 0x00 to 0xF5.
        // This emulator uses one array, with the two original register arrays
        // starting at 0x00 and at 0x100.
        var registerAddress = (array << 8) | address;
        // If the address is out of the OPL3 memory map, returns.
        if (registerAddress < 0 || registerAddress >= 0x200) return;

        this.registers[registerAddress] = data;
        switch (address & 0xe0){
            // The first 3 bits masking gives the type of the register by using its base address:
            // 0x00, 0x20, 0x40, 0x60, 0x80, 0xA0, 0xC0, 0xE0
            // When it is needed, we further separate the register type inside each base address,
            // which is the case of 0x00 and 0xA0.

            // Through out this emulator we will use the same name convention to
            // reference a byte with several bit registers.
            // The name of each bit register will be followed by the number of bits
            // it occupies inside the byte.
            // Numbers without accompanying names are unused bits.
            case 0x00:
                // Unique registers for the entire OPL3:
                if (array == 1){
                    if (address == 0x04) this.update_2_CONNECTIONSEL6();
                    else if (address == 0x05){
                        //console.log(array, address, data);
                        this.update_7_NEW1();
                    }
                }else if (address == 0x08) this.update_1_NTS1_6();
                break;
            case 0xA0:
                // 0xBD is a control register for the entire OPL3:
                if (address == 0xBD){
                    if (array == 0) this.update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1();
                    break;
                }
                // Registers for each channel are in A0-A8, B0-B8, C0-C8, in both register arrays.
                // 0xB0...0xB8 keeps kon,block,fnum(h) for each channel.
                if ((address & 0xF0) == 0xB0 && address <= 0xB8){
                    // If the address is in the second register array, adds 9 to the channel number.
                    // The channel number is given by the last four bits, like in A0,...,A8.
                    this.channels[array][address & 0x0F].update_2_KON1_BLOCK3_FNUMH2();
                    break;
                }
                // 0xA0...0xA8 keeps fnum(l) for each channel.
                if ((address & 0xF0) == 0xA0 && address <= 0xA8) this.channels[array][address&0x0F].update_FNUML8();
                break;
            // 0xC0...0xC8 keeps cha,chb,chc,chd,fb,cnt for each channel:
            case 0xC0:
                if (address <= 0xC8) this.channels[array][address & 0x0F].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
                break;
            // Registers for each of the 36 Operators:
            default:
                var operatorOffset = address & 0x1F;
                if (!this.operators[array][operatorOffset]) break;
                switch (address & 0xE0){
                    // 0x20...0x35 keeps am,vib,egt,ksr,mult for each operator:
                    case 0x20:
                        this.operators[array][operatorOffset].update_AM1_VIB1_EGT1_KSR1_MULT4();
                        break;
                    // 0x40...0x55 keeps ksl,tl for each operator:
                    case 0x40:
                        this.operators[array][operatorOffset].update_KSL2_TL6();
                        break;
                    // 0x60...0x75 keeps ar,dr for each operator:
                    case 0x60:
                        this.operators[array][operatorOffset].update_AR4_DR4();
                        break;
                    // 0x80...0x95 keeps sl,rr for each operator:
                    case 0x80:
                        this.operators[array][operatorOffset].update_SL4_RR4();
                        break;
                    // 0xE0...0xF5 keeps ws for each operator:
                    case 0xE0:
                        this.operators[array][operatorOffset].update_5_WS3();
                }
        }
    },
    initOperators: function(){
        // The YMF262 has 36 operators:
        this.operators = [[], []];
        for (var array = 0; array < 2; array++){
            for (var group = 0; group <= 0x10; group += 8){
                for (var offset = 0; offset < 6; offset++){
                    var baseAddress = (array << 8) | (group + offset);
                    this.operators[array][group + offset] = new Operator(baseAddress, this);
                }
            }
        }

        // Create specific operators to switch when in rhythm mode:
        this.highHatOperator = new HighHatOperator(this);
        this.snareDrumOperator = new SnareDrumOperator(this);
        this.tomTomOperator = new TomTomOperator(this);
        this.topCymbalOperator = new TopCymbalOperator(this);

        // Save operators when they are in non-rhythm mode:
        // Channel 7:
        this.highHatOperatorInNonRhythmMode = this.operators[0][0x11];
        this.snareDrumOperatorInNonRhythmMode = this.operators[0][0x14];
        // Channel 8:
        this.tomTomOperatorInNonRhythmMode = this.operators[0][0x12];
        this.topCymbalOperatorInNonRhythmMode = this.operators[0][0x15];
    },
    initChannels2op: function(){
        // The YMF262 has 18 2-op channels.
        // Each 2-op channel can be at a serial or parallel operator configuration:
        this.channels2op = [[], []];

        for (var array = 0; array < 2; array++){
            for (var channelNumber = 0; channelNumber < 3; channelNumber++){
                var baseAddress = (array << 8) | channelNumber;
                // Channels 1, 2, 3 -> Operator offsets 0x0,0x3; 0x1,0x4; 0x2,0x5
                this.channels2op[array][channelNumber] = new Channel2op(baseAddress, this.operators[array][channelNumber], this.operators[array][channelNumber + 0x3], this);
                // Channels 4, 5, 6 -> Operator offsets 0x8,0xB; 0x9,0xC; 0xA,0xD
                this.channels2op[array][channelNumber + 3] = new Channel2op(baseAddress + 3, this.operators[array][channelNumber + 0x8], this.operators[array][channelNumber + 0xb], this);
                // Channels 7, 8, 9 -> Operators 0x10,0x13; 0x11,0x14; 0x12,0x15
                this.channels2op[array][channelNumber + 6] = new Channel2op(baseAddress + 6, this.operators[array][channelNumber + 0x10], this.operators[array][channelNumber + 0x13], this);
            }
        }
    },
    initChannels4op: function(){
        // The YMF262 has 3 4-op channels in each array:
        this.channels4op = [[], []];

        for (var array = 0; array < 2; array++){
            for (var channelNumber = 0; channelNumber < 3; channelNumber++){
                var baseAddress = (array << 8) | channelNumber;
                // Channels 1, 2, 3 -> Operators 0x0,0x3,0x8,0xB; 0x1,0x4,0x9,0xC; 0x2,0x5,0xA,0xD;
                this.channels4op[array][channelNumber] = new Channel4op(
                    baseAddress,
                    this.operators[array][channelNumber],
                    this.operators[array][channelNumber + 0x3],
                    this.operators[array][channelNumber + 0x8],
                    this.operators[array][channelNumber + 0xb],
                    this
                );
            }
        }
    },
    initRhythmChannels: function(){
        this.bassDrumChannel = new BassDrumChannel(this);
        this.highHatSnareDrumChannel = new HighHatSnareDrumChannel(this);
        this.tomTomTopCymbalChannel = new TomTomTopCymbalChannel(this);
    },
    initChannels: function(){
        // Channel is an abstract class that can be a 2-op, 4-op, rhythm or disabled channel,
        // depending on the OPL3 configuration at the time.
        // channels[] inits as a 2-op serial channel array:
        for (var array = 0; array < 2; array++){
            for (var i = 0; i < 9; i++) this.channels[array][i] = this.channels2op[array][i];
        }

        // Unique instance to fill future gaps in the Channel array,
        // when there will be switches between 2op and 4op mode.
        this.disabledChannel = new DisabledChannel(this);
    },
    update_1_NTS1_6: function(){
        var _1_nts1_6 = this.registers[OPL3Data._1_NTS1_6_Offset];
        // Note Selection. This register is used in Channel.updateOperators() implementations,
        // to calculate the channel´s Key Scale Number.
        // The value of the actual envelope rate follows the value of
        // OPL3.nts,Operator.keyScaleNumber and Operator.ksr
        this.nts = (_1_nts1_6 & 0x40) >> 6;
    },
    update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1: function(){
        var dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 = this.registers[OPL3Data.DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset];
        // Depth of amplitude. This register is used in EnvelopeGenerator.getEnvelope();
        this.dam = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x80) >> 7;

        // Depth of vibrato. This register is used in PhaseGenerator.getPhase();
        this.dvb = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x40) >> 6;

        var new_ryt = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x20) >> 5;
        if (new_ryt != this.ryt){
            this.ryt = new_ryt;
            this.setRhythmMode();
        }

        var new_bd = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x10) >> 4;
        if (new_bd != this.bd){
            this.bd = new_bd;
            if (this.bd == 1){
                this.bassDrumChannel.op1.keyOn();
                this.bassDrumChannel.op2.keyOn();
            }
        }

        var new_sd = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x08) >> 3;
        if (new_sd != this.sd){
            this.sd = new_sd;
            if (this.sd == 1) this.snareDrumOperator.keyOn();
        }

        var new_tom = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x04) >> 2;
        if (new_tom != this.tom) {
            this.tom = new_tom;
            if (this.tom == 1) this.tomTomOperator.keyOn();
        }

        var new_tc = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x02) >> 1;
        if (new_tc != this.tc) {
            this.tc = new_tc;
            if (this.tc == 1) this.topCymbalOperator.keyOn();
        }

        var new_hh = dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x01;
        if (new_hh != this.hh) {
            this.hh = new_hh;
            if (this.hh == 1) this.highHatOperator.keyOn();
        }
    },
    update_7_NEW1: function(){
        var _7_new1 = this.registers[OPL3Data._7_NEW1_Offset];
        // OPL2/OPL3 mode selection. This register is used in
        // OPL3.read(), OPL3.write() and Operator.getOperatorOutput();
        this._new = (_7_new1 & 0x01);
        if (this._new == 1) this.setEnabledChannels();
        this.set4opConnections();
    },
    setEnabledChannels: function(){
        for (var array = 0; array < 2; array++){
            for (var i = 0; i < 9; i++){
                var baseAddress = this.channels[array][i].channelBaseAddress;
                this.registers[baseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] |= 0xf0;
                this.channels[array][i].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
            }
        }
    },
    update_2_CONNECTIONSEL6: function(){
        // This method is called only if _new is set.
        var _2_connectionsel6 = this.registers[OPL3Data._2_CONNECTIONSEL6_Offset];
        // 2-op/4-op channel selection. This register is used here to configure the OPL3.channels[] array.
        this.connectionsel = (_2_connectionsel6 & 0x3f);
        this.set4opConnections();
    },
    set4opConnections: function(){
        // bits 0, 1, 2 sets respectively 2-op channels (1,4), (2,5), (3,6) to 4-op operation.
        // bits 3, 4, 5 sets respectively 2-op channels (10,13), (11,14), (12,15) to 4-op operation.
        for (var array = 0; array < 2; ++array){
            for (var i = 0; i < 3; ++i){
                if (this._new == 1){
                    var shift = array * 3 + i;
                    var connectionBit = (this.connectionsel >> shift) & 0x01;
                    if (connectionBit == 1){
                        this.channels[array][i] = this.channels4op[array][i];
                        this.channels[array][i + 3] = this.disabledChannel;
                        this.channels[array][i].updateChannel();
                        continue;
                    }
                }

                this.channels[array][i] = this.channels2op[array][i];
                this.channels[array][i + 3] = this.channels2op[array][i + 3];
                this.channels[array][i].updateChannel();
                this.channels[array][i + 3].updateChannel();
            }
        }
    },
    setRhythmMode: function(){
        var i;
        if (this.ryt == 1){
            this.channels[0][6] = this.bassDrumChannel;
            this.channels[0][7] = this.highHatSnareDrumChannel;
            this.channels[0][8] = this.tomTomTopCymbalChannel;
            this.operators[0][0x11] = this.highHatOperator;
            this.operators[0][0x14] = this.snareDrumOperator;
            this.operators[0][0x12] = this.tomTomOperator;
            this.operators[0][0x15] = this.topCymbalOperator;
        }else{
            for (i = 6; i <= 8; i++) this.channels[0][i] = this.channels2op[0][i];
            this.operators[0][0x11] = this.highHatOperatorInNonRhythmMode;
            this.operators[0][0x14] = this.snareDrumOperatorInNonRhythmMode;
            this.operators[0][0x12] = this.tomTomOperatorInNonRhythmMode;
            this.operators[0][0x15] = this.topCymbalOperatorInNonRhythmMode;
        }

        for (i = 6; i <= 8; i++) this.channels[0][i].updateChannel();
    }
});

function Channel(baseAddress, opl){
    this.opl = opl;
    this.channelBaseAddress = baseAddress;

    this.fnuml = 0;
    this.fnumh = 0;
    this.kon = 0;
    this.block = 0;
    this.cha = 0;
    this.chb = 0;
    this.chc = 0;
    this.chd = 0;
    this.fb = 0;
    this.cnt = 0;

    this.feedback = [0, 0];
    this.toPhase = 4;

    this.output = new Float64Array(4);
}

extend(Channel.prototype, {
    update_2_KON1_BLOCK3_FNUMH2: function(){
        var _2_kon1_block3_fnumh2 = this.opl.registers[this.channelBaseAddress + ChannelData._2_KON1_BLOCK3_FNUMH2_Offset];

        // Frequency Number (hi-register) and Block. These two registers, together with fnuml,
        // sets the Channel´s base frequency;
        this.block = (_2_kon1_block3_fnumh2 & 0x1c) >> 2;
        this.fnumh = _2_kon1_block3_fnumh2 & 0x03;
        this.updateOperators();

        // Key On. If changed, calls Channel.keyOn() / keyOff().
        var newKon = (_2_kon1_block3_fnumh2 & 0x20) >> 5;
        if (newKon != this.kon){
            if (newKon == 1) this.keyOn();
            else this.keyOff();
            this.kon = newKon;
        }
    },
    update_FNUML8: function(){
        var fnuml8 = this.opl.registers[this.channelBaseAddress + ChannelData.FNUML8_Offset];
        // Frequency Number, low register.
        this.fnuml = fnuml8 & 0xff;

        this.updateOperators();
    },
    update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1: function(){
        var chd1_chc1_chb1_cha1_fb3_cnt1 = this.opl.registers[this.channelBaseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset];

        this.chd = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x80) >> 7;
        this.chc = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x40) >> 6;
        this.chb = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x20) >> 5;
        this.cha = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x10) >> 4;
        this.fb = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x0e) >> 1;
        this.cnt = chd1_chc1_chb1_cha1_fb3_cnt1 & 0x01;

        this.updateOperators();
    },
    updateChannel: function(){
        this.update_2_KON1_BLOCK3_FNUMH2();
        this.update_FNUML8();
        this.update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
    },
    getInFourChannels: function(channelOutput){
        if (this.opl._new == 0){
            this.output[0] = this.output[1] = this.output[2] = this.output[3] = channelOutput;
        }else{
            this.output[0] = (this.cha == 1) ? channelOutput : 0;
            this.output[1] = (this.chb == 1) ? channelOutput : 0;
            this.output[2] = (this.chc == 1) ? channelOutput : 0;
            this.output[3] = (this.chd == 1) ? channelOutput : 0;
        }

        return this.output;
    }
});

function Channel2op(baseAddress, o1, o2, opl){
    Channel.call(this, baseAddress, opl);
    this.op1 = o1;
    this.op2 = o2;
}
util.inherits(Channel2op, Channel);

Channel2op.prototype.getChannelOutput = function(){
    var channelOutput = 0, op1Output = 0, op2Output = 0;
    // The feedback uses the last two outputs from
    // the first operator, instead of just the last one.
    var feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;

    if (this.cnt == 0){
        // CNT = 0, the operators are in series, with the first in feedback.
        if (this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);
        op1Output = this.op1.getOperatorOutput(feedbackOutput);
        channelOutput = this.op2.getOperatorOutput(op1Output * this.toPhase);
    }else{
        // CNT = 1, the operators are in parallel, with the first in feedback.
        if (this.op1.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
            this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);
        op1Output = this.op1.getOperatorOutput(feedbackOutput);
        op2Output = this.op2.getOperatorOutput(Operator.noModulator);
        channelOutput = (op1Output + op2Output) / 2;
    }

    this.feedback[0] = this.feedback[1];
    this.feedback[1] = (op1Output * ChannelData.feedback[this.fb]) % 1;
    return this.getInFourChannels(channelOutput);
};
Channel2op.prototype.keyOn = function(){
    this.op1.keyOn();
    this.op2.keyOn();
    this.feedback[0] = this.feedback[1] = 0;
};
Channel2op.prototype.keyOff = function(){
    this.op1.keyOff();
    this.op2.keyOff();
};
Channel2op.prototype.updateOperators = function(){
    // Key Scale Number, used in EnvelopeGenerator.setActualRates().
    var keyScaleNumber = this.block * 2 + ((this.fnumh >> this.opl.nts) & 0x01);
    var f_number = (this.fnumh << 8) | this.fnuml;
    this.op1.updateOperator(keyScaleNumber, f_number, this.block);
    this.op2.updateOperator(keyScaleNumber, f_number, this.block);
};

function Channel4op(baseAddress, o1, o2, o3, o4, opl){
    Channel.call(this, baseAddress, opl);
    this.op1 = o1;
    this.op2 = o2;
    this.op3 = o3;
    this.op4 = o4;
}
util.inherits(Channel4op, Channel);

Channel4op.prototype.getChannelOutput = function(){
    var channelOutput = 0,
        op1Output = 0, op2Output = 0, op3Output = 0, op4Output = 0;

    var secondChannelBaseAddress = this.channelBaseAddress + 3;
    var secondCnt = this.opl.registers[secondChannelBaseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] & 1;
    var cnt4op = (this.cnt << 1) | secondCnt;

    var feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;

    switch (cnt4op) {
        case 0:
            if(this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);

            op1Output = this.op1.getOperatorOutput(feedbackOutput);
            op2Output = this.op2.getOperatorOutput(op1Output * this.toPhase);
            op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);

            channelOutput = this.op4.getOperatorOutput(op3Output * this.toPhase);
            break;
        case 1:
            if (this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);

            op1Output = this.op1.getOperatorOutput(feedbackOutput);
            op2Output = this.op2.getOperatorOutput(op1Output * this.toPhase);

            op3Output = this.op3.getOperatorOutput(Operator.noModulator);
            op4Output = this.op4.getOperatorOutput(op3Output * this.toPhase);

            channelOutput = (op2Output + op4Output) / 2;
            break;
        case 2:
            if (this.op1.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);

            op1Output = this.op1.getOperatorOutput(feedbackOutput);
            op2Output = this.op2.getOperatorOutput(Operator.noModulator);
            op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);
            op4Output = this.op4.getOperatorOutput(op3Output * this.toPhase);

            channelOutput = (op1Output + op4Output) / 2;
            break;
        case 3:
            if (this.op1.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF &&
                this.op3.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF &&
                this.op4.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) return this.getInFourChannels(0);

            op1Output = this.op1.getOperatorOutput(feedbackOutput);
            op2Output = this.op2.getOperatorOutput(Operator.noModulator);
            op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);
            op4Output = this.op4.getOperatorOutput(Operator.noModulator);

            channelOutput = (op1Output + op3Output + op4Output) / 3;
            break;
    }

    this.feedback[0] = this.feedback[1];
    this.feedback[1] = (op1Output * ChannelData.feedback[this.fb]) % 1;

    return this.getInFourChannels(channelOutput);
};
Channel4op.prototype.keyOn = function(){
    this.op1.keyOn();
    this.op2.keyOn();
    this.op3.keyOn();
    this.op4.keyOn();
    this.feedback[0] = this.feedback[1] = 0;
};
Channel4op.prototype.keyOff = function(){
    this.op1.keyOff();
    this.op2.keyOff();
    this.op3.keyOff();
    this.op4.keyOff();
};
Channel4op.prototype.updateOperators = function(){
    // Key Scale Number, used in EnvelopeGenerator.setActualRates().
    var keyScaleNumber = this.block * 2 + ((this.fnumh >> this.opl.nts) & 0x01);
    var f_number = (this.fnumh << 8) | this.fnuml;
    this.op1.updateOperator(keyScaleNumber, f_number, this.block);
    this.op2.updateOperator(keyScaleNumber, f_number, this.block);
    this.op3.updateOperator(keyScaleNumber, f_number, this.block);
    this.op4.updateOperator(keyScaleNumber, f_number, this.block);
};

function DisabledChannel(opl){
    Channel.call(this, 0, opl);
    this.opl = opl;
}
util.inherits(DisabledChannel, Channel);

DisabledChannel.prototype.getChannelOutput = function(){ return this.getInFourChannels(0); };
DisabledChannel.prototype.keyOn = function(){ };
DisabledChannel.prototype.keyOff = function(){ };
DisabledChannel.prototype.updateOperators = function(){ };

function Operator(baseAddress, opl){
    this.opl = opl;

    this.operatorBaseAddress = baseAddress;
    this.phaseGenerator = new PhaseGenerator(opl);
    this.envelopeGenerator = new EnvelopeGenerator(opl);

    this.envelope = 0;
    this.am = 0;
    this.vib = 0;
    this.ksr = 0;
    this.egt = 0;
    this.mult = 0;
    this.ksl = 0;
    this.tl = 0;
    this.ar = 0;
    this.dr = 0;
    this.sl = 0;
    this.rr = 0;
    this.ws = 0;
    this.keyScaleNumber = 0;
    this.f_number = 0;
    this.block = 0;
}
Operator.noModulator = 0;

extend(Operator.prototype, {
    update_AM1_VIB1_EGT1_KSR1_MULT4: function(){
        var am1_vib1_egt1_ksr1_mult4 = this.opl.registers[this.operatorBaseAddress + OperatorData.AM1_VIB1_EGT1_KSR1_MULT4_Offset];

        // Amplitude Modulation. This register is used int EnvelopeGenerator.getEnvelope();
        this.am = (am1_vib1_egt1_ksr1_mult4 & 0x80) >> 7;
        // Vibrato. This register is used in PhaseGenerator.getPhase();
        this.vib = (am1_vib1_egt1_ksr1_mult4 & 0x40) >> 6;
        // Envelope Generator Type. This register is used in EnvelopeGenerator.getEnvelope();
        this.egt = (am1_vib1_egt1_ksr1_mult4 & 0x20) >> 5;
        // Key Scale Rate. Sets the actual envelope rate together with rate and keyScaleNumber.
        // This register os used in EnvelopeGenerator.setActualAttackRate().
        this.ksr = (am1_vib1_egt1_ksr1_mult4 & 0x10) >> 4;
        // Multiple. Multiplies the Channel.baseFrequency to get the Operator.operatorFrequency.
        // This register is used in PhaseGenerator.setFrequency().
        this.mult = am1_vib1_egt1_ksr1_mult4 & 0x0f;

        this.phaseGenerator.setFrequency(this.f_number, this.block, this.mult);
        this.envelopeGenerator.setActualAttackRate(this.ar, this.ksr, this.keyScaleNumber);
        this.envelopeGenerator.setActualDecayRate(this.dr, this.ksr, this.keyScaleNumber);
        this.envelopeGenerator.setActualReleaseRate(this.rr, this.ksr, this.keyScaleNumber);
    },
    update_KSL2_TL6: function(){
        var ksl2_tl6 = this.opl.registers[this.operatorBaseAddress + OperatorData.KSL2_TL6_Offset];

        // Key Scale Level. Sets the attenuation in accordance with the octave.
        this.ksl = (ksl2_tl6 & 0xc0) >> 6;
        // Total Level. Sets the overall damping for the envelope.
        this.tl = ksl2_tl6 & 0x3f;

        this.envelopeGenerator.setAtennuation(this.f_number, this.block, this.ksl);
        this.envelopeGenerator.setTotalLevel(this.tl);
    },
    update_AR4_DR4: function(){
        var ar4_dr4 = this.opl.registers[this.operatorBaseAddress + OperatorData.AR4_DR4_Offset];

        // Attack Rate.
        this.ar = (ar4_dr4 & 0xf0) >> 4;
        // Decay Rate.
        this.dr = ar4_dr4 & 0x0f;

        this.envelopeGenerator.setActualAttackRate(this.ar, this.ksr, this.keyScaleNumber);
        this.envelopeGenerator.setActualDecayRate(this.dr, this.ksr, this.keyScaleNumber);
    },
    update_SL4_RR4: function(){
        var sl4_rr4 = this.opl.registers[this.operatorBaseAddress + OperatorData.SL4_RR4_Offset];

        // Sustain Level.
        this.sl = (sl4_rr4 & 0xf0) >> 4;
        // Release Rate.
        this.rr = sl4_rr4 & 0x0f;

        this.envelopeGenerator.setActualSustainLevel(this.sl);
        this.envelopeGenerator.setActualReleaseRate(this.rr, this.ksr, this.keyScaleNumber);
    },
    update_5_WS3: function(){
        var _5_ws3 = this.opl.registers[this.operatorBaseAddress + OperatorData._5_WS3_Offset];
        this.ws = _5_ws3 & 0x07;
    },
    getOperatorOutput: function(modulator){
        if (this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return 0;

        var envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
        this.envelope = Math.pow(10, envelopeInDB / 10);

        // If it is in OPL2 mode, use first four waveforms only:
        this.ws = this.ws & ((this.opl._new << 2) + 3);
        var waveform = OperatorData.waveforms[this.ws];

        this.phase = this.phaseGenerator.getPhase(this.vib);

        return this.getOutput(modulator, this.phase, waveform);
    },
    getOutput: function(modulator, outputPhase, waveform) {
        outputPhase = (outputPhase + modulator) % 1;
        if (outputPhase < 0){
            outputPhase++;
            // If the double could not afford to be less than 1:
            outputPhase %= 1;
        }
        var sampleIndex = (outputPhase * OperatorData.waveLength) | 0;
        return waveform[sampleIndex] * this.envelope;
    },
    keyOn: function(){
        if (this.ar > 0){
            this.envelopeGenerator.keyOn();
            this.phaseGenerator.keyOn();
        }else this.envelopeGenerator.stage = EnvelopeGenerator.Stage.OFF;
    },
    keyOff: function(){
        this.envelopeGenerator.keyOff();
    },
    updateOperator: function(ksn, f_num, blk) {
        this.keyScaleNumber = ksn;
        this.f_number = f_num;
        this.block = blk;

        this.update_AM1_VIB1_EGT1_KSR1_MULT4();
        this.update_KSL2_TL6();
        this.update_AR4_DR4();
        this.update_SL4_RR4();
        this.update_5_WS3();
    }
});

function EnvelopeGenerator(opl){
    this.opl = opl;
    this.stage = EnvelopeGenerator.Stage.OFF;
    this.actualAttackRate = 0;
    this.actualDecayRate = 0;
    this.actualReleaseRate = 0;
    this.xAttackIncrement = 0;
    this.xMinimumInAttack = 0;
    this.dBdecayIncrement = 0;
    this.dBreleaseIncrement = 0;
    this.attenuation = 0;
    this.totalLevel = 0;
    this.sustainLevel = 0;
    this.x = this.dBtoX(-96);
    this.resolutionMaximum = this.dBtoX(-0.1875);
    this.percentage10 = this.percentageToX(0.1);
    this.percentage90 = this.percentageToX(0.9);
    
    this.envelope = -96;
}
EnvelopeGenerator.Stage = {
    ATTACK: 'ATTACK',
    DECAY: 'DECAY',
    SUSTAIN: 'SUSTAIN',
    RELEASE: 'RELEASE',
    OFF: 'OFF'
};

extend(EnvelopeGenerator.prototype, {
    setActualSustainLevel: function(sl){
        // If all SL bits are 1, sustain level is set to -93 dB:
        if (sl == 0x0f){
            this.sustainLevel = -93;
            return;
        }
        // The datasheet states that the SL formula is
        // sustainLevel = -24*d7 -12*d6 -6*d5 -3*d4,
        // translated as:
        this.sustainLevel = -3 * sl;
    },
    setTotalLevel: function(tl) {
        // The datasheet states that the TL formula is
        // TL = -(24*d5 + 12*d4 + 6*d3 + 3*d2 + 1.5*d1 + 0.75*d0),
        // translated as:
        this.totalLevel = tl * -0.75;
    },
    setAtennuation: function(f_number, block, ksl){
        var hi4bits = (f_number >> 6) & 0x0f;
        switch (ksl){
            case 0:
                this.attenuation = 0;
                break;
            case 1:
                // ~3 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block];
                break;
            case 2:
                // ~1.5 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block] / 2;
                break;
            case 3:
                // ~6 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block] * 2;
        }
    },
    setActualAttackRate: function(attackRate, ksr, keyScaleNumber) {
        // According to the YMF278B manual's OPL3 section, the attack curve is exponential,
        // with a dynamic range from -96 dB to 0 dB and a resolution of 0.1875 dB
        // per level.
        //
        // This method sets an attack increment and attack minimum value
        // that creates a exponential dB curve with 'period0to100' seconds in length
        // and 'period10to90' seconds between 10% and 90% of the curve total level.
        this.actualAttackRate = this.calculateActualRate(attackRate, ksr, keyScaleNumber) | 0;
        var period0to100inSeconds = EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][0] / 1000;
        var period0to100inSamples = (period0to100inSeconds * OPL3Data.sampleRate) | 0;
        var period10to90inSeconds = EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][1] / 1000;
        var period10to90inSamples = (period10to90inSeconds * OPL3Data.sampleRate) | 0;
        // The x increment is dictated by the period between 10% and 90%:
        this.xAttackIncrement = OPL3Data.calculateIncrement(this.percentage10, this.percentage90, period10to90inSeconds);
        // Discover how many samples are still from the top.
        // It cannot reach 0 dB, since x is a logarithmic parameter and would be
        // negative infinity. So we will use -0.1875 dB as the resolution
        // maximum.
        //
        // percentageToX(0.9) + samplesToTheTop*xAttackIncrement = dBToX(-0.1875); ->
        // samplesToTheTop = (dBtoX(-0.1875) - percentageToX(0.9)) / xAttackIncrement); ->
        // period10to100InSamples = period10to90InSamples + samplesToTheTop; ->
        var period10to100inSamples = (period10to90inSamples + (this.resolutionMaximum - this.percentage90) / this.xAttackIncrement) | 0;
        // Discover the minimum x that, through the attackIncrement value, keeps
        // the 10%-90% period, and reaches 0 dB at the total period:
        this.xMinimumInAttack = this.percentage10 - (period0to100inSamples - period10to100inSamples) * this.xAttackIncrement;
    },
    setActualDecayRate: function(decayRate, ksr, keyScaleNumber){
        this.actualDecayRate = this.calculateActualRate(decayRate, ksr, keyScaleNumber) | 0;
        var period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualDecayRate][1] / 1000;
        // Differently from the attack curve, the decay/release curve is linear.
        // The dB increment is dictated by the period between 10% and 90%:
        this.dBdecayIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
    },
    setActualReleaseRate: function(releaseRate, ksr, keyScaleNumber){
        this.actualReleaseRate = this.calculateActualRate(releaseRate, ksr, keyScaleNumber) | 0;
        var period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualReleaseRate][1] / 1000;
        this.dBreleaseIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
    },
    calculateActualRate: function(rate, ksr, keyScaleNumber){
        var rof = EnvelopeGeneratorData.rateOffset[ksr][keyScaleNumber];
        var actualRate = rate * 4 + rof;
        // If, as an example at the maximum, rate is 15 and the rate offset is 15,
        // the value would
        // be 75, but the maximum allowed is 63:
        if (actualRate > 63) actualRate = 63;
        return actualRate;
    },
    getEnvelope: function(egt, am){
        // The datasheets attenuation values
        // must be halved to match the real OPL3 output.
        var envelopeSustainLevel = this.sustainLevel / 2;
        var envelopeTremolo = OPL3Data.tremoloTable[this.opl.dam][this.opl.tremoloIndex] / 2;
        var envelopeAttenuation = this.attenuation / 2;
        var envelopeTotalLevel = this.totalLevel / 2;

        var envelopeMinimum = -96;
        var envelopeResolution = 0.1875;

        var outputEnvelope;
        //
        // Envelope Generation
        //
        switch (this.stage){
            case EnvelopeGenerator.Stage.ATTACK:
                // Since the attack is exponential, it will never reach 0 dB, so
                // we´ll work with the next to maximum in the envelope resolution.
                if (this.envelope < -envelopeResolution && this.xAttackIncrement != -Infinity){
                    // The attack is exponential.
                    this.envelope = -Math.pow(2, this.x);
                    this.x += this.xAttackIncrement;
                    break;
                }else{
                    // It is needed here to explicitly set envelope = 0, since
                    // only the attack can have a period of
                    // 0 seconds and produce an infinity envelope increment.
                    this.envelope = 0;
                    this.stage = EnvelopeGenerator.Stage.DECAY;
                }
            case EnvelopeGenerator.Stage.DECAY:
                // The decay and release are linear.
                if (this.envelope > envelopeSustainLevel){
                    this.envelope -= this.dBdecayIncrement;
                    break;
                }else this.stage = EnvelopeGenerator.Stage.SUSTAIN;
            case EnvelopeGenerator.Stage.SUSTAIN:
                // The Sustain stage is mantained all the time of the Key ON,
                // even if we are in non-sustaining mode.
                // This is necessary because, if the key is still pressed, we can
                // change back and forth the state of EGT, and it will release and
                // hold again accordingly.
                if (egt == 1) break;
                else{
                    if (this.envelope > envelopeMinimum) this.envelope -= this.dBreleaseIncrement;
                    else this.stage = EnvelopeGenerator.Stage.OFF;
                }
                break;
            case EnvelopeGenerator.Stage.RELEASE:
                // If we have Key OFF, only here we are in the Release stage.
                // Now, we can turn EGT back and forth and it will have no effect,i.e.,
                // it will release inexorably to the Off stage.
                if (this.envelope > envelopeMinimum) this.envelope -= this.dBreleaseIncrement;
                else this.stage = EnvelopeGenerator.Stage.OFF;
        }

        // Ongoing original envelope
        outputEnvelope = this.envelope;

        //Tremolo
        if (am == 1) outputEnvelope += envelopeTremolo;

        //Attenuation
        outputEnvelope += envelopeAttenuation;

        //Total Level
        outputEnvelope += envelopeTotalLevel;

        return outputEnvelope;
    },
    keyOn: function(){
        // If we are taking it in the middle of a previous envelope,
        // start to rise from the current level:
        // envelope = - (2 ^ x); ->
        // 2 ^ x = -envelope ->
        // x = log2(-envelope); ->
        var xCurrent = Math.log2(-this.envelope);
        this.x = xCurrent < this.xMinimumInAttack ? xCurrent : this.xMinimumInAttack;
        this.stage = EnvelopeGenerator.Stage.ATTACK;
    },
    keyOff: function(){
        if (this.stage != EnvelopeGenerator.Stage.OFF) this.stage = EnvelopeGenerator.Stage.RELEASE;
    },
    dBtoX: function(dB){
        return Math.log2(-dB);
    },
    percentageToDB: function(percentage){
        return Math.log10(percentage) * 10;
    },
    percentageToX: function(percentage){
        return this.dBtoX(this.percentageToDB(percentage));
    }
});

function PhaseGenerator(opl){
    this.opl = opl;
    this.phase = 0;
    this.phaseIncrement = 0;
}

extend(PhaseGenerator.prototype, {
    setFrequency: function(f_number, block, mult){
        // This frequency formula is derived from the following equation:
        // f_number = baseFrequency * pow(2,19) / sampleRate / pow(2,block-1);
        var baseFrequency = f_number * Math.pow(2, block - 1) * OPL3Data.sampleRate / Math.pow(2, 19);
        var operatorFrequency = baseFrequency * OperatorData.multTable[mult];

        // phase goes from 0 to 1 at
        // period = (1/frequency) seconds ->
        // Samples in each period is (1/frequency)*sampleRate =
        // = sampleRate/frequency ->
        // So the increment in each sample, to go from 0 to 1, is:
        // increment = (1-0) / samples in the period ->
        // increment = 1 / (OPL3Data.sampleRate/operatorFrequency) ->
        this.phaseIncrement = operatorFrequency / OPL3Data.sampleRate;
    },
    getPhase: function(vib){
        if (vib == 1){
            // phaseIncrement = (operatorFrequency * vibrato) / sampleRate
            this.phase += this.phaseIncrement * OPL3Data.vibratoTable[this.opl.dvb][this.opl.vibratoIndex];
        }else{
            // phaseIncrement = operatorFrequency / sampleRate
            this.phase += this.phaseIncrement;
        }

        this.phase %= 1;
        return this.phase;
    },
    keyOn: function(){
        this.phase = 0;
    }
});

function RhythmChannel(baseAddress, o1, o2, opl){
    Channel2op.call(this, baseAddress, o1, o2, opl);
}
util.inherits(RhythmChannel, Channel2op);

RhythmChannel.prototype.getChannelOutput = function(){
    var channelOutput = 0, op1Output = 0, op2Output = 0;

    // Note that, different from the common channel,
    // we do not check to see if the Operator's envelopes are Off.
    // Instead, we always do the calculations,
    // to update the publicly available phase.
    op1Output = this.op1.getOperatorOutput(Operator.noModulator);
    op2Output = this.op2.getOperatorOutput(Operator.noModulator);
    channelOutput = (op1Output + op2Output) / 2;

    return this.getInFourChannels(channelOutput);
};
RhythmChannel.prototype.keyOn = function(){ };
RhythmChannel.prototype.keyOff = function(){ };

function HighHatSnareDrumChannel(opl){
    RhythmChannel.call(this, 7, opl.highHatOperator, opl.snareDrumOperator, opl);
}
util.inherits(HighHatSnareDrumChannel, RhythmChannel);

function TomTomTopCymbalChannel(opl){
    RhythmChannel.call(this, 8, opl.tomTomOperator, opl.topCymbalOperator, opl);
}
util.inherits(TomTomTopCymbalChannel, RhythmChannel);

function TopCymbalOperator(baseAddress, opl){
    if (arguments.length == 1){
        opl = baseAddress;
        baseAddress = 0x15;
    }
    Operator.call(this, baseAddress, opl);
}
util.inherits(TopCymbalOperator, Operator);

TopCymbalOperator.prototype.getOperatorOutput = function(modulator, externalPhase){
    // The Top Cymbal operator uses his own phase together with the High Hat phase.
    if (typeof externalPhase == 'undefined') externalPhase = this.opl.highHatOperator.phase * OperatorData.multTable[this.opl.highHatOperator.mult];

    var envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
    this.envelope = Math.pow(10, envelopeInDB / 10);

    this.phase = this.phaseGenerator.getPhase(this.vib);

    var waveIndex = (this.ws & ((this.opl._new << 2) + 3)) | 0;
    var waveform = OperatorData.waveforms[waveIndex];

    // Empirically tested multiplied phase for the Top Cymbal:
    var carrierPhase = (8 * this.phase) % 1;
    var modulatorPhase = externalPhase;
    var modulatorOutput = this.getOutput(Operator.noModulator, modulatorPhase, waveform);
    var carrierOutput = this.getOutput(modulatorOutput, carrierPhase, waveform);

    var cycles = 4;
    if ((carrierPhase * cycles) % cycles > 0.1) carrierOutput = 0;

    return carrierOutput * 2;
};

function HighHatOperator(opl){
    TopCymbalOperator.call(this, 0x11, opl);
}
util.inherits(HighHatOperator, TopCymbalOperator);

HighHatOperator.prototype.getOperatorOutput = function(modulator){
    var topCymbalOperatorPhase = this.opl.topCymbalOperator.phase * OperatorData.multTable[this.opl.topCymbalOperator.mult];
    // The sound output from the High Hat resembles the one from
    // Top Cymbal, so we use the parent method and modifies his output
    // accordingly afterwards.
    var operatorOutput = TopCymbalOperator.prototype.getOperatorOutput.call(this, modulator, topCymbalOperatorPhase);
    if (operatorOutput == 0) operatorOutput = Math.random() * this.envelope;
    return operatorOutput;
};

function SnareDrumOperator(opl){
    Operator.call(this, 0x14, opl);
}
util.inherits(SnareDrumOperator, Operator);

SnareDrumOperator.prototype.getOperatorOutput = function(modulator){
    if (this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return 0;

    var envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
    this.envelope = Math.pow(10, envelopeInDB / 10);

    // If it is in OPL2 mode, use first four waveforms only:
    var waveIndex = (this.ws & ((this.opl._new << 2) + 3)) | 0;
    var waveform = OperatorData.waveforms[waveIndex];

    this.phase = this.opl.highHatOperator.phase * 2;

    var operatorOutput = this.getOutput(modulator, this.phase, waveform);

    var noise = Math.random() * this.envelope;

    if (operatorOutput / this.envelope != 1 && operatorOutput / this.envelope != -1){
        if (operatorOutput > 0) operatorOutput = noise;
        else if (operatorOutput < 0) operatorOutput = -noise;
        else operatorOutput = 0;
    }

    return operatorOutput * 2;
};

function TomTomOperator(opl){
    Operator.call(this, 0x12, opl);
}
util.inherits(TomTomOperator, Operator);

function BassDrumChannel(opl){
    Channel2op.call(this, 6, new Operator(0x10, opl), new Operator(0x13, opl), opl);
}
util.inherits(BassDrumChannel, Channel2op);

BassDrumChannel.prototype.getChannelOutput = function(){
    // Bass Drum ignores first operator, when it is in series.
    if (this.cnt == 1) this.op1.ar = 0;
    return Channel2op.prototype.getChannelOutput.call(this);
};
BassDrumChannel.prototype.keyOn = function(){ };
BassDrumChannel.prototype.keyOff = function(){ };

var OPL3Data = {
    // OPL3-wide registers offsets:
    _1_NTS1_6_Offset: 0x08,
    DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset: 0xbd,
    _7_NEW1_Offset: 0x105,
    _2_CONNECTIONSEL6_Offset: 0x104,
    sampleRate: 49700,
    // The first array is used when DVB=0 and the second array is used when DVB=1.
    vibratoTable: [new Float64Array(8192), new Float64Array(8192)],
    // First array used when AM = 0 and second array used when AM = 1.
    tremoloTable: [new Float64Array(13432), new Float64Array(13432)],
    loadVibratoTable: function(vibratoTable){
        // According to the YMF262 datasheet, the OPL3 vibrato repetition rate is 6.1 Hz.
        // According to the YMF278B manual, it is 6.0 Hz.
        // The information that the vibrato table has 8 levels standing 1024 samples each
        // was taken from the emulator by Jarek Burczynski and Tatsuyuki Satoh,
        // with a frequency of 6,06689453125 Hz, what  makes sense with the difference
        // in the information on the datasheets.

        var semitone = Math.pow(2, 1 / 12);
        var cent = Math.pow(semitone, 1 / 100);

        // When dvb=0, the depth is 7 cents, when it is 1, the depth is 14 cents.
        var DVB0 = Math.pow(cent, 7);
        var DVB1 = Math.pow(cent, 14);

        var i;
        for (i = 0; i < 1024; i++){
            vibratoTable[0][i] = vibratoTable[1][i] = 1;
        }

        for (; i < 2048; i++){
            vibratoTable[0][i] = Math.sqrt(DVB0);
            vibratoTable[1][i] = Math.sqrt(DVB1);
        }

        for (; i < 3072; i++){
            vibratoTable[0][i] = DVB0;
            vibratoTable[1][i] = DVB1;
        }

        for (; i < 4096; i++){
            vibratoTable[0][i] = Math.sqrt(DVB0);
            vibratoTable[1][i] = Math.sqrt(DVB1);
        }

        for (; i < 5120; i++){
            vibratoTable[0][i] = vibratoTable[1][i] = 1;
        }

        for (; i < 6144; i++){
            vibratoTable[0][i] = 1 / Math.sqrt(DVB0);
            vibratoTable[1][i] = 1 / Math.sqrt(DVB1);
        }

        for (; i < 7168; i++){
            vibratoTable[0][i] = 1 / DVB0;
            vibratoTable[1][i] = 1 / DVB1;
        }

        for (; i < 8192; i++){
            vibratoTable[0][i] = 1 / Math.sqrt(DVB0);
            vibratoTable[1][i] = 1 / Math.sqrt(DVB1);
        }
    },
    loadTremoloTable: function(tremoloTable){
        // The OPL3 tremolo repetition rate is 3.7 Hz.
        var tremoloFrequency = 3.7;

        // The tremolo depth is -1 dB when DAM = 0, and -4.8 dB when DAM = 1.
        var tremoloDepth = [-1, -4.8];

        //  According to the YMF278B manual's OPL3 section graph,
        //              the tremolo waveform is not
        //   \      /   a sine wave, but a single triangle waveform.
        //    \    /    Thus, the period to achieve the tremolo depth is T/2, and
        //     \  /     the increment in each T/2 section uses a frequency of 2*f.
        //      \/      Tremolo varies from 0 dB to depth, to 0 dB again, at frequency*2:
        var tremoloIncrement = [
            OPL3Data.calculateIncrement(tremoloDepth[0], 0, 1 / (2 * tremoloFrequency)),
            OPL3Data.calculateIncrement(tremoloDepth[1], 0, 1 / (2 * tremoloFrequency))
        ];
        var tremoloTableLength = (OPL3Data.sampleRate / tremoloFrequency) | 0;

        // This is undocumented. The tremolo starts at the maximum attenuation,
        // instead of at 0 dB:
        tremoloTable[0][0] = tremoloDepth[0];
        tremoloTable[1][0] = tremoloDepth[1];

        var counter = 0;
        // The first half of the triangle waveform:
        while (tremoloTable[0][counter] < 0){
            counter++;
            tremoloTable[0][counter] = tremoloTable[0][counter - 1] + tremoloIncrement[0];
            tremoloTable[1][counter] = tremoloTable[1][counter - 1] + tremoloIncrement[1];
        }

        // The second half of the triangle waveform:
        while (tremoloTable[0][counter] > tremoloDepth[0] && counter < tremoloTableLength - 1){
            counter++;
            tremoloTable[0][counter] = tremoloTable[0][counter - 1] - tremoloIncrement[0];
            tremoloTable[1][counter] = tremoloTable[1][counter - 1] - tremoloIncrement[1];
        }
    },
    calculateIncrement: function(begin, end, period){
        return (end - begin) / OPL3Data.sampleRate * (1 / period);
    }
};

OPL3Data.loadVibratoTable(OPL3Data.vibratoTable);
OPL3Data.loadTremoloTable(OPL3Data.tremoloTable);

var ChannelData = {
    _2_KON1_BLOCK3_FNUMH2_Offset: 0xb0,
    FNUML8_Offset: 0xa0,
    CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset: 0xc0,
    // Feedback rate in fractions of 2*Pi, normalized to (0,1):
    // 0, Pi/16, Pi/8, Pi/4, Pi/2, Pi, 2*Pi, 4*Pi turns to be:
    feedback: [0, 1/32, 1/16, 1/8, 1/4, 1/2, 1, 2]
};

var OperatorData = {
    AM1_VIB1_EGT1_KSR1_MULT4_Offset: 0x20,
    KSL2_TL6_Offset: 0x40,
    AR4_DR4_Offset: 0x60,
    SL4_RR4_Offset: 0x80,
    _5_WS3_Offset: 0xe0,
    NO_MODULATION: 'NO_MODULATION',
    CARRIER: 'CARRIER',
    FEEDBACK: 'FEEDBACK',
    waveLength: 1024,
    multTable: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 12, 12, 15, 15],
    ksl3dBtable: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, -3, -6, -9],
        [0, 0, 0, 0, -3, -6, -9, -12],
        [0, 0, 0, -1.875, -4.875, -7.875, -10.875, -13.875],

        [0, 0, 0, -3, -6, -9, -12, -15],
        [0, 0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125],
        [0, 0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875],
        [0, 0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625],

        [0, 0, -3, -6, -9, -12, -15, -18],
        [0, -0.750, -3.750, -6.750, -9.750, -12.750, -15.750, -18.750],
        [0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125, -19.125],
        [0, -1.500, -4.500, -7.500, -10.500, -13.500, -16.500, -19.500],

        [0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875, -19.875],
        [0, -2.250, -5.250, -8.250, -11.250, -14.250, -17.250, -20.250],
        [0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625, -20.625],
        [0, -3, -6, -9, -12, -15, -18, -21]
    ],
    waveforms: [
        new Float64Array(1024), new Float64Array(1024), new Float64Array(1024), new Float64Array(1024),
        new Float64Array(1024), new Float64Array(1024), new Float64Array(1024), new Float64Array(1024)
    ],
    loadWaveforms: function(waveforms){
        var i, theta, x;
        // 1st waveform: sinusoid.
        for (i = 0, theta = 0; i < 1024; i++, theta += (2 * Math.PI / 1024)){
            waveforms[0][i] = Math.sin(theta);
        }

        var sineTable = waveforms[0];
        // 2nd: first half of a sinusoid.
        for (i = 0; i < 512; i++){
            waveforms[1][i] = sineTable[i];
            waveforms[1][512 + i] = 0;
        }

        // 3rd: double positive sinusoid.
        for (i = 0; i < 512; i++){
            waveforms[2][i] = waveforms[2][512 + i] = sineTable[i];
        }

        // 4th: first and third quarter of double positive sinusoid.
        for (i = 0; i < 256; i++){
            waveforms[3][i] = waveforms[3][512 + i] = sineTable[i];
            waveforms[3][256 + i] = waveforms[3][768 + i] = 0;
        }

        // 5th: first half with double frequency sinusoid.
        for (i = 0; i < 512; i++){
            waveforms[4][i] = sineTable[i * 2];
            waveforms[4][512 + i] = 0;
        }

        // 6th: first half with double frequency positive sinusoid.
        for (i = 0; i < 256; i++){
            waveforms[5][i] = waveforms[5][256 + i] = sineTable[i * 2];
            waveforms[5][512 + i] = waveforms[5][768 + i] = 0;
        }

        // 7th: square wave
        for (i = 0; i < 512; i++){
            waveforms[6][i] = 1;
            waveforms[6][512 + i] = -1;
        }

        // 8th: exponential
        for (i = 0, x = 0; i < 512; i++, x += (16 / 256)) {
            waveforms[7][i] = Math.pow(2, -x);
            waveforms[7][1023 - i] = -Math.pow(2, -(x + 1 / 16));
        }
    }
};

OperatorData.loadWaveforms(OperatorData.waveforms);

var EnvelopeGeneratorData = {
    // This table is indexed by the value of Operator.ksr
    // and the value of ChannelRegister.keyScaleNumber.
    rateOffset: [
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    ],
    // These attack periods in miliseconds were taken from the YMF278B manual.
    // The attack actual rates range from 0 to 63, with different data for
    // 0%-100% and for 10%-90%:
    attackTimeValuesTable: [
        [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity],
        [2826.24, 1482.75], [2252.80, 1155.07], [1884.16, 991.23], [1597.44, 868.35],
        [1413.12, 741.38], [1126.40, 577.54], [942.08, 495.62], [798.72, 434.18],
        [706.56, 370.69], [563.20, 288.77], [471.04, 247.81], [399.36, 217.09],

        [353.28, 185.34], [281.60, 144.38], [235.52, 123.90], [199.68, 108.54],
        [176.76, 92.67], [140.80, 72.19], [117.76, 61.95], [99.84, 54.27],
        [88.32, 46.34], [70.40, 36.10], [58.88, 30.98], [49.92, 27.14],
        [44.16, 23.17], [35.20, 18.05], [29.44, 15.49], [24.96, 13.57],

        [22.08, 11.58], [17.60, 9.02], [14.72, 7.74], [12.48, 6.78],
        [11.04, 5.79], [8.80, 4.51], [7.36, 3.87], [6.24, 3.39],
        [5.52, 2.90], [4.40, 2.26], [3.68, 1.94], [3.12, 1.70],
        [2.76, 1.45], [2.20, 1.13], [1.84, 0.97], [1.56, 0.85],

        [1.40, 0.73], [1.12, 0.61], [0.92, 0.49], [0.80, 0.43],
        [0.70, 0.37], [0.56, 0.31], [0.46, 0.26], [0.42, 0.22],
        [0.38, 0.19], [0.30, 0.14], [0.24, 0.11], [0.20, 0.11],
        [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]
    ],
    // These decay and release periods in miliseconds were taken from the YMF278B manual.
    // The rate index range from 0 to 63, with different data for
    // 0%-100% and for 10%-90%:
    decayAndReleaseTimeValuesTable: [
        [Infinity, Infinity],    [Infinity, Infinity],    [Infinity, Infinity],    [Infinity, Infinity],
        [39280.64, 8212.48], [31416.32, 6574.08], [26173.44, 5509.12], [22446.08, 4730.88],
        [19640.32, 4106.24], [15708.16, 3287.04], [13086.72, 2754.56], [11223.04, 2365.44],
        [9820.16, 2053.12], [7854.08, 1643.52], [6543.36, 1377.28], [5611.52, 1182.72],

        [4910.08, 1026.56], [3927.04, 821.76], [3271.68, 688.64], [2805.76, 591.36],
        [2455.04, 513.28], [1936.52, 410.88], [1635.84, 344.34], [1402.88, 295.68],
        [1227.52, 256.64], [981.76, 205.44], [817.92, 172.16], [701.44, 147.84],
        [613.76, 128.32], [490.88, 102.72], [488.96, 86.08], [350.72, 73.92],

        [306.88, 64.16], [245.44, 51.36], [204.48, 43.04], [175.36, 36.96],
        [153.44, 32.08], [122.72, 25.68], [102.24, 21.52], [87.68, 18.48],
        [76.72, 16.04], [61.36, 12.84], [51.12, 10.76], [43.84, 9.24],
        [38.36, 8.02], [30.68, 6.42], [25.56, 5.38], [21.92, 4.62],

        [19.20, 4.02], [15.36, 3.22], [12.80, 2.68], [10.96, 2.32],
        [9.60, 2.02], [7.68, 1.62], [6.40, 1.35], [5.48, 1.15],
        [4.80, 1.01], [3.84, 0.81], [3.20, 0.69], [2.74, 0.58],
        [2.40, 0.51], [2.40, 0.51], [2.40, 0.51], [2.40, 0.51]
    ]
};

},{"extend":18,"util":46}],9:[function(_dereq_,module,exports){
(function (process,Buffer){
var Readable = _dereq_('stream').Readable;
var util = _dereq_('util');
var WritableStreamBuffer = _dereq_('stream-buffers').WritableStreamBuffer;
_dereq_('setimmediate');

var OPL3 = _dereq_('./opl3');
var Normalizer = _dereq_('pcm-normalizer');

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

                        self.emit('progress', Math.floor(player.position / player.data.byteLength * 1000) / 10);

                        var chunkSize = (n / 2) | 0;
                        if (options.bufferSize){
                            while(chunkSize > 0){
                                var samplesSize = Math.min(options.bufferSize * 2, chunkSize);
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
}).call(this,_dereq_('_process'),_dereq_("buffer").Buffer)
},{"./opl3":8,"_process":25,"buffer":13,"pcm-normalizer":23,"setimmediate":26,"stream":27,"stream-buffers":41,"util":46}],10:[function(_dereq_,module,exports){
'use strict'

exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

function init () {
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
}

init()

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],11:[function(_dereq_,module,exports){

},{}],12:[function(_dereq_,module,exports){
(function (global){
'use strict';

var buffer = _dereq_('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"buffer":13}],13:[function(_dereq_,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')
var isArray = _dereq_('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  that.write(string, encoding)
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

function arrayIndexOf (arr, val, byteOffset, encoding) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var foundIndex = -1
  for (var i = byteOffset; i < arrLength; ++i) {
    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
      if (foundIndex === -1) foundIndex = i
      if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
    } else {
      if (foundIndex !== -1) i -= i - foundIndex
      foundIndex = -1
    }
  }

  return -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  if (Buffer.isBuffer(val)) {
    // special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(this, val, byteOffset, encoding)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset, encoding)
  }

  throw new TypeError('val must be string, number or Buffer')
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":10,"ieee754":19,"isarray":14}],14:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],15:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":_dereq_("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":21}],16:[function(_dereq_,module,exports){
DataView.prototype.getString = function(offset, length){
    var end = typeof length == 'number' ? offset + length : this.byteLength;
    var text = '';
    var val = -1;

    while (offset < this.byteLength && offset < end){
        val = this.getUint8(offset++);
        if (val == 0) break;
        text += String.fromCharCode(val);
    }

    return text;
};
},{}],17:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],18:[function(_dereq_,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],19:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],20:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],21:[function(_dereq_,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],22:[function(_dereq_,module,exports){
(function (Buffer){
var Transform = _dereq_('stream').Transform;
var util = _dereq_('util');

function From16To32Bit(){
    Transform.call(this);
}

From16To32Bit.prototype._transform = function(chunk, encoding, done){
    var b32 = new Float32Array(chunk.byteLength / 2);
    var dv = new DataView(chunk.buffer);
    for (var i = 0, offset = 0; offset < chunk.byteLength; i++, offset += 2){
        var v = dv.getInt16(offset, true);
        b32[i] = v > 0 ? v / 32767 : v / 32768;
    }
    done(null, new Buffer(b32.buffer));
};

util.inherits(From16To32Bit, Transform);
module.exports.From16To32Bit = From16To32Bit;

function From32To16Bit(){
    Transform.call(this);
}

From32To16Bit.prototype._transform = function(chunk, encoding, done){
    var b16 = new Int16Array(chunk.byteLength / 4);
    var dv = new DataView(chunk.buffer);
    for (var i = 0, offset = 0; offset < chunk.byteLength; i++, offset += 4){
        var v = dv.getFloat32(offset, true);
        b16[i] = v > 0 ? v * 32767 : v * 32768;
    }
    done(null, new Buffer(b16.buffer));
};

util.inherits(From32To16Bit, Transform);
module.exports.From32To16Bit = From32To16Bit;
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":13,"stream":27,"util":46}],23:[function(_dereq_,module,exports){
var Transform = _dereq_('stream').Transform;
var WritableStreamBuffer = _dereq_('stream-buffers').WritableStreamBuffer;
var util = _dereq_('util');

function Normalizer(bitDepth){
    if (typeof bitDepth != 'undefined' && !(bitDepth == 16 || bitDepth == 32)) throw new Error('Unsupported bit depth');

    Transform.call(this);
    var self = this;

    var WritableStreamBuffer = _dereq_('stream-buffers').WritableStreamBuffer;
    var writer = new WritableStreamBuffer({
        initialSize: (1024 * 1024),
        incrementAmount: (512 * 1024)
    });

    var peak = 0;
    var scale = 1;
    var targetPeak = (bitDepth == 32 ? 1 : 32767);
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
},{"stream":27,"stream-buffers":41,"util":46}],24:[function(_dereq_,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,_dereq_('_process'))
},{"_process":25}],25:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout.call(null, cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout.call(null, timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout.call(null, drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(_dereq_,module,exports){
(function (process,global){
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":25}],27:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = _dereq_('events').EventEmitter;
var inherits = _dereq_('inherits');

inherits(Stream, EE);
Stream.Readable = _dereq_('readable-stream/readable.js');
Stream.Writable = _dereq_('readable-stream/writable.js');
Stream.Duplex = _dereq_('readable-stream/duplex.js');
Stream.Transform = _dereq_('readable-stream/transform.js');
Stream.PassThrough = _dereq_('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":17,"inherits":20,"readable-stream/duplex.js":29,"readable-stream/passthrough.js":35,"readable-stream/readable.js":36,"readable-stream/transform.js":37,"readable-stream/writable.js":38}],28:[function(_dereq_,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14}],29:[function(_dereq_,module,exports){
module.exports = _dereq_("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":30}],30:[function(_dereq_,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = _dereq_('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = _dereq_('core-util-is');
util.inherits = _dereq_('inherits');
/*</replacement>*/

var Readable = _dereq_('./_stream_readable');
var Writable = _dereq_('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":32,"./_stream_writable":34,"core-util-is":15,"inherits":20,"process-nextick-args":24}],31:[function(_dereq_,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = _dereq_('./_stream_transform');

/*<replacement>*/
var util = _dereq_('core-util-is');
util.inherits = _dereq_('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":33,"core-util-is":15,"inherits":20}],32:[function(_dereq_,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = _dereq_('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = _dereq_('isarray');
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = _dereq_('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = _dereq_('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = _dereq_('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = _dereq_('buffer').Buffer;
/*<replacement>*/
var bufferShim = _dereq_('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = _dereq_('core-util-is');
util.inherits = _dereq_('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = _dereq_('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

var hasPrependListener = typeof EE.prototype.prependListener === 'function';

function prependListener(emitter, event, fn) {
  if (hasPrependListener) return emitter.prependListener(event, fn);

  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS. This is here
  // only because this code needs to continue to work with older versions
  // of Node.js that do not include the prependListener() method. The goal
  // is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

var Duplex;
function ReadableState(options, stream) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = _dereq_('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

var Duplex;
function Readable(options) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = _dereq_('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended) return 0;

  if (state.objectMode) return n === 0 ? 0 : 1;

  if (n === null || isNaN(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length) return state.buffer[0].length;else return state.length;
  }

  if (n <= 0) return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else {
      return state.length;
    }
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading) n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended) state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0) endReadable(this);

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && !this._readableState.endEmitted) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0) return null;

  if (length === 0) ret = null;else if (objectMode) ret = list.shift();else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode) ret = list.join('');else if (list.length === 1) ret = list[0];else ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode) ret = '';else ret = bufferShim.allocUnsafe(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var _buf = list[0];
        var cpy = Math.min(n - c, _buf.length);

        if (stringMode) ret += _buf.slice(0, cpy);else _buf.copy(ret, c, 0, cpy);

        if (cpy < _buf.length) list[0] = _buf.slice(cpy);else list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,_dereq_('_process'))
},{"./_stream_duplex":30,"_process":25,"buffer":13,"buffer-shims":12,"core-util-is":15,"events":17,"inherits":20,"isarray":28,"process-nextick-args":24,"string_decoder/":43,"util":11}],33:[function(_dereq_,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = _dereq_('./_stream_duplex');

/*<replacement>*/
var util = _dereq_('core-util-is');
util.inherits = _dereq_('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":30,"core-util-is":15,"inherits":20}],34:[function(_dereq_,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = _dereq_('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = _dereq_('core-util-is');
util.inherits = _dereq_('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: _dereq_('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = _dereq_('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = _dereq_('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = _dereq_('buffer').Buffer;
/*<replacement>*/
var bufferShim = _dereq_('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

var Duplex;
function WritableState(options, stream) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

var Duplex;
function Writable(options) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,_dereq_('_process'))
},{"./_stream_duplex":30,"_process":25,"buffer":13,"buffer-shims":12,"core-util-is":15,"events":17,"inherits":20,"process-nextick-args":24,"util-deprecate":44}],35:[function(_dereq_,module,exports){
module.exports = _dereq_("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":31}],36:[function(_dereq_,module,exports){
(function (process){
var Stream = (function (){
  try {
    return _dereq_('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = _dereq_('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = _dereq_('./lib/_stream_writable.js');
exports.Duplex = _dereq_('./lib/_stream_duplex.js');
exports.Transform = _dereq_('./lib/_stream_transform.js');
exports.PassThrough = _dereq_('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,_dereq_('_process'))
},{"./lib/_stream_duplex.js":30,"./lib/_stream_passthrough.js":31,"./lib/_stream_readable.js":32,"./lib/_stream_transform.js":33,"./lib/_stream_writable.js":34,"_process":25}],37:[function(_dereq_,module,exports){
module.exports = _dereq_("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":33}],38:[function(_dereq_,module,exports){
module.exports = _dereq_("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":34}],39:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  DEFAULT_INITIAL_SIZE: (8 * 1024),
  DEFAULT_INCREMENT_AMOUNT: (8 * 1024),
  DEFAULT_FREQUENCY: 1,
  DEFAULT_CHUNK_SIZE: 1024
};

},{}],40:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

var stream = _dereq_('stream');
var constants = _dereq_('./constants');
var util = _dereq_('util');

var ReadableStreamBuffer = module.exports = function(opts) {
  var that = this;
  opts = opts || {};

  stream.Readable.call(this, opts);

  this.stopped = false;

  var frequency = opts.hasOwnProperty('frequency') ? opts.frequency : constants.DEFAULT_FREQUENCY;
  var chunkSize = opts.chunkSize || constants.DEFAULT_CHUNK_SIZE;
  var initialSize = opts.initialSize || constants.DEFAULT_INITIAL_SIZE;
  var incrementAmount = opts.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;

  var size = 0;
  var buffer = new Buffer(initialSize);

  var sendData = function() {
    var amount = Math.min(chunkSize, size);
    var sendMore = false;

    if (amount > 0) {
      var chunk = null;
      chunk = new Buffer(amount);
      buffer.copy(chunk, 0, 0, amount);

      sendMore = that.push(chunk);

      buffer.copy(buffer, 0, amount, size);
      size -= amount;
    }

    if(size === 0 && that.stopped) {
      that.push(null);
    }

    if (sendMore) {
      sendData.timeout = setTimeout(sendData, frequency);
    }
  };

  this.stop = function() {
    if (this.stopped) {
      throw new Error('stop() called on already stopped ReadableStreamBuffer');
    }
    this.stopped = true;

    if (size === 0) {
      this.push(null);
    }
  };

  this.size = function() {
    return size;
  };

  this.maxSize = function() {
    return buffer.length;
  };

  var increaseBufferIfNecessary = function(incomingDataSize) {
    if((buffer.length - size) < incomingDataSize) {
      var factor = Math.ceil((incomingDataSize - (buffer.length - size)) / incrementAmount);

      var newBuffer = new Buffer(buffer.length + (incrementAmount * factor));
      buffer.copy(newBuffer, 0, 0, size);
      buffer = newBuffer;
    }
  };

  this.put = function(data, encoding) {
    if (that.stopped) {
      throw new Error('Tried to write data to a stopped ReadableStreamBuffer');
    }

    if(Buffer.isBuffer(data)) {
      increaseBufferIfNecessary(data.length);
      data.copy(buffer, size, 0);
      size += data.length;
    }
    else {
      data = data + '';
      var dataSizeInBytes = Buffer.byteLength(data);
      increaseBufferIfNecessary(dataSizeInBytes);
      buffer.write(data, size, encoding || 'utf8');
      size += dataSizeInBytes;
    }
  };

  this._read = function() {
    if (!sendData.timeout) {
      sendData.timeout = setTimeout(sendData, frequency);
    }
  };
};

util.inherits(ReadableStreamBuffer, stream.Readable);

}).call(this,_dereq_("buffer").Buffer)
},{"./constants":39,"buffer":13,"stream":27,"util":46}],41:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./constants');
module.exports.ReadableStreamBuffer = _dereq_('./readable_streambuffer');
module.exports.WritableStreamBuffer = _dereq_('./writable_streambuffer');

},{"./constants":39,"./readable_streambuffer":40,"./writable_streambuffer":42}],42:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

var util = _dereq_('util');
var stream = _dereq_('stream');
var constants = _dereq_('./constants');

var WritableStreamBuffer = module.exports = function(opts) {
  opts = opts || {};
  opts.decodeStrings = true;

  stream.Writable.call(this, opts);

  var initialSize = opts.initialSize || constants.DEFAULT_INITIAL_SIZE;
  var incrementAmount = opts.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;

  var buffer = new Buffer(initialSize);
  var size = 0;

  this.size = function() {
    return size;
  };

  this.maxSize = function() {
    return buffer.length;
  };

  this.getContents = function(length) {
    if(!size) return false;

    var data = new Buffer(Math.min(length || size, size));
    buffer.copy(data, 0, 0, data.length);

    if(data.length < size)
      buffer.copy(buffer, 0, data.length);

    size -= data.length;

    return data;
  };

  this.getContentsAsString = function(encoding, length) {
    if(!size) return false;

    var data = buffer.toString(encoding || 'utf8', 0, Math.min(length || size, size));
    var dataLength = Buffer.byteLength(data);

    if(dataLength < size)
      buffer.copy(buffer, 0, dataLength);

    size -= dataLength;
    return data;
  };

  var increaseBufferIfNecessary = function(incomingDataSize) {
    if((buffer.length - size) < incomingDataSize) {
      var factor = Math.ceil((incomingDataSize - (buffer.length - size)) / incrementAmount);

      var newBuffer = new Buffer(buffer.length + (incrementAmount * factor));
      buffer.copy(newBuffer, 0, 0, size);
      buffer = newBuffer;
    }
  };

  this._write = function(chunk, encoding, callback) {
    increaseBufferIfNecessary(chunk.length);
    chunk.copy(buffer, size, 0);
    size += chunk.length;
    callback();
  };
};

util.inherits(WritableStreamBuffer, stream.Writable);

}).call(this,_dereq_("buffer").Buffer)
},{"./constants":39,"buffer":13,"stream":27,"util":46}],43:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = _dereq_('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":13}],44:[function(_dereq_,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],45:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],46:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":45,"_process":25,"inherits":20}],47:[function(_dereq_,module,exports){
_dereq_('dataview-getstring');

function VoiceData(data){
    this.modulatorTremolo = data.getUint8(0);
    this.modulatorAttack = data.getUint8(1);
    this.modulatorSustain = data.getUint8(2);
    this.modulatorWaveform = data.getUint8(3);
    this.modulatorKey = data.getUint8(4);
    this.modulatorOutput = data.getUint8(5);
    this.feedback = data.getUint8(6);
    this.carrierTremolo = data.getUint8(7);
    this.carrierAttack = data.getUint8(8);
    this.carrierSustain = data.getUint8(9);
    this.carrierWaveform = data.getUint8(10);
    this.carrierKey = data.getUint8(11);
    this.carrierOutput = data.getUint8(12);
    this.baseNoteOffset = data.getInt16(14, true);
}

function OPLInstrument(name, data){
    this.name = name;
    this.data = data;
    this.flags = data.getUint16(0, true);

    this.fixedPitch = !!(this.flags & 1);
    this.unknown = !!(this.flags & 2);
    this.doubleVoice = !!(this.flags & 4);

    this.fineTuning = data.getUint8(2);
    this.fixedNote = data.getUint8(3);

    this.voices = [new VoiceData(new DataView(data.buffer.slice(4, 20))), new VoiceData(new DataView(data.buffer.slice(20, 36)))];
}

function GENMIDI(lump){
    lump = lump instanceof DataView ? lump : new DataView(lump.buffer || lump);
    this.header = lump.getString(0, 8);
    this.instruments = [];
    for (var i = 8, j = 175 * 36 + 8; i < 175 * 36 + 8; i += 36, j += 32){
        var name = lump.getString(j);
        this.instruments.push(new OPLInstrument(name, new DataView(lump.buffer.slice(i, i + 36))));
    }
    this.lump = lump;
}

module.exports = GENMIDI;
},{"dataview-getstring":16}],48:[function(_dereq_,module,exports){
(function (Buffer){
var markers = {
    RIFF: new Buffer('RIFF'),
    WAVE: new Buffer('WAVE'),
    fmt: new Buffer('fmt '),
    data: new Buffer('data')
};

function WAV(data, options){
    options = options || {};
    var sampleRate = options.sampleRate || 44100;
    var bitDepth = options.bitDepth || 32;
    var channels = options.channels || 2;

    data = new Buffer(data.buffer || data);
    var output = new Buffer(data.byteLength + 44);
    var dv = new DataView(output.buffer);

    var blockAlign = (channels * bitDepth) >> 3;
    var byteRate = blockAlign * sampleRate;
    var subChunk2Size = (data.byteLength / (bitDepth == 32 ? 4 : 2)) * channels * (bitDepth >> 3);
    var chunkSize = 36 + subChunk2Size;

    output.set(markers.RIFF, 0);
    dv.setUint32(4, chunkSize, true);
    output.set(markers.WAVE, 8);
    output.set(markers.fmt, 12);
    dv.setUint32(16, 16, true);
    dv.setUint16(20, bitDepth == 32 ? 3 : 1, true);
    dv.setUint16(22, channels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, byteRate, true);
    dv.setUint16(32, blockAlign, true);
    dv.setUint16(34, bitDepth, true);
    output.set(markers.data, 36);
    dv.setUint32(40, subChunk2Size, true);
    output.set(data, 44);

	return output.buffer;
}

module.exports = WAV;
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":13}]},{},[7])(7)
});