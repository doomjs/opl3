var extend = require('extend');
var GENMIDI = require('wad-genmidi');

function MUS(opl, options){
    options = options || {};

    this.opl = opl;
    if (options.instruments && (options.instruments.buffer || options.instruments) instanceof ArrayBuffer) options.instruments = new GENMIDI(options.instruments).instruments;
    this.instruments = options.instruments || require('./genmidi.json').instruments;
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