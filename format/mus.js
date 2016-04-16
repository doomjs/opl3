var extend = require('extend');

function MUS(opl, instruments){
    this.opl = opl;
    this.adlib_data = new Int32Array(0x200);
    this.instruments = instruments;
}
module.exports = MUS;

extend(MUS.prototype, {
    adlib_opadd: [0x00, 0x01, 0x02, 0x08, 0x09, 0x0A, 0x10, 0x11, 0x12, 0x100, 0x101, 0x102, 0x108, 0x109, 0x10a, 0x110, 0x111, 0x112],
    maxVoice: 18,
    load: function(buffer){
        if (!(buffer instanceof Buffer)) buffer = new Buffer(buffer);

        if (buffer.toString(0, 3) != 'MUS' && buffer.byteAt(3) != 0x1a) throw new Error('Buffer is not a MUS file');
        this.scoreLength = buffer.wordAt(4, true);
        this.scoreStart = buffer.wordAt(6, true);
        this.channelCount = buffer.wordAt(8, true);
        this.secondaryChannels = buffer.wordAt(10, true);
        this.instrumentsCount = buffer.wordAt(12, true);

        this.channelInstruments = [];
        for (var i = 0, j = 16; i < this.instrumentsCount; i++, j += 2){
            this.channelInstruments.push(buffer.wordAt(j, true));
        }

        this.channels = [];
        for (var i = 0; i < this.channelCount; i++){
            this.channels[i] = new MUSChannel();
        }
        this.channels[15] = new MUSChannel();

        this.position = 0;
        this.data = buffer.data;

        this.voices = [];
        for (var i = 0; i < this.maxVoice; i++){
            this.voices[i] = {
                channel: -1
            };
        }

        this.rewind();
        console.log(this);
    },
    update: function(){
        if (this.position >= this.data.length){
            console.log('unexpected end');
            return false;
        }

        var last = 0;
        while (!last){
            var event = this.data[this.position++];
            var channel = event & 0xf;
            var type = (event & 0x70) >> 4;
            last = event & 0x80;

            switch (type){
                case 0: //release note
                    var note = this.data[this.position++] & 0x7f;

                    if (channel == 15){
                        var percNote = note - 35 + 128;
                        if (this.instruments[percNote]){
                            note = this.instruments[percNote].fixedNote;
                        }else{
                            console.log('percussion instrument missing on release note', note, percNote);
                            break;
                        }
                    }

                    for (var i = 0; i < this.maxVoice; i++){
                        if (this.voices[i].channel == channel && this.voices[i].note == note){
                            this.midi_fm_endnote(i);
                            this.voices[i].channel = -1;
                            this.channels[channel].pitch = 128;
                        }
                    }
                    break;
                case 1: //play note
                    var data = this.data[this.position++];
                    var note = data & 0x7f;
                    var vel = this.channels[channel].velocity;
                    if (data & 0x80){
                        this.channels[channel].velocity = vel = this.data[this.position++] & 0x7f;
                    }

                    if (channel == 15){
                        var percNote = note - 35 + 128;
                        if (this.instruments[percNote]){
                            this.channels[channel].instrument = this.instruments[percNote];
                            note = this.instruments[percNote].fixedNote;
                        }else{
                            console.log('percussion instrument missing on play note', note, percNote);
                            break;
                        }
                    }

                    var inst = this.channels[channel].instrument;
                    var on = this.findVoice(channel, note + inst.voices[0].baseNoteOffset);
                    this.playVoice(on, channel, inst, inst.voices[0], note + inst.voices[0].baseNoteOffset, vel);
                    break;
                case 2: //pitch wheel
                    var pitch = this.data[this.position++];
                    this.channels[channel].pitch = pitch;
                    for (var i = 0; i < this.maxVoice; i++){
                        var voice = this.voices[i];
                        if (voice.channel == channel){
                            this.midi_fm_playnote(i, voice.note, voice.velocity, pitch);
                            break;
                        }
                    }
                    break;
                case 3: //system event
                    var number = this.data[this.position++] & 0x7f;
                    console.log('system event', channel, number);
                    break;
                case 4: //change controller
                    var ctrl = this.data[this.position++] & 0x7f;
                    var value = this.data[this.position++] & 0x7f;
                    switch (ctrl){
                        case 0: //instrument number
                            this.channels[channel].instrument = this.instruments[value];
                            break;
                        case 1: //bank select
                            console.log('bank select', channel, value);
                            break;
                        case 2: //modulation pot
                            console.log('modulation pot', channel, value);
                            break;
                        case 3: //volume
                            this.channels[channel].volume = value;
                            for (var i = 0; i < this.maxVoice; i++){
                                var voice = this.voices[i];
                                if (voice.channel == channel){
                                    this.midi_fm_volume(i, voice.velocity)
                                    break;
                                }
                            }
                            break;
                        case 4: //panning
                            this.channels[channel].panning = value;
                            console.log('set panning', channel, value);
                            break;
                        case 5: //expression pot
                            console.log('expression pot', channel, value);
                            break;
                        case 6: //reverb depth
                            console.log('reverb depth', channel, value);
                            break;
                        case 7: //chorus depth
                            console.log('chorus depth', channel, value);
                            break;
                        case 8: //sustain pedal
                            console.log('sustain pedal', channel, value);
                            break;
                        case 9: //soft pedal
                            console.log('soft pedal', channel, value);
                            break;
                        default:
                            console.log('unknown controller', channel, ctrl, value);
                            break;
                    }
                    break;
                case 6: //score end
                    console.log('score end', this.maxVoiceOn);
                    for (var i = 0; i < this.maxVoice; i++){
                        if (this.voices[i].channel > 0){
                            this.midi_fm_endnote(i);
                        }
                    }
                    this.rewind();
                    return false;
            }
        }

        var time = 0;
        while (true){
            var byte = this.data[this.position++];
            time = time * 128 + (byte & 0x7f);
            if (!(byte & 0x80)) break;
        }

        this.wait = time * 140;

        return true;
    },
    refresh: function(){
        return Math.min(this.wait, 100);
    },
    rewind: function(){
        this.position = this.scoreStart;
        this.midi_fm_reset();
    },
    playVoice: function(on, channel, inst, voice, note, vel, pitch){
        if (this.voices[on].voice != voice) this.midi_fm_instrument(on, voice);

        this.voices[on].instrument = inst;
        this.voices[on].voice = voice;
        this.voices[on].channel = channel;
        this.voices[on].note = note;
        this.voices[on].velocity = vel;
        this.voices[on].timestamp = Date.now();

        this.midi_fm_playnote(on, note, vel, pitch || this.channels[channel].pitch);
    },
    findVoice: function(channel, note){
        var on = -1;
        /*for (var i = 0; i < this.maxVoice; i++){
            if (this.voices[i].channel == channel /*&& this.voices[i].note == note){
                on = i;
                this.midi_fm_endnote(on);
                return on;
            }
        }*/

        /*if (on < 0){
            var channelVoiceCount = 0;
            var maxVoicePerChannel = channel == 15 ? 9 : 2;
            for (var i = 0; i < this.maxVoice; i++){
                if (this.voices[i].instrument == this.channels[channel].instrument){
                    if (on < 0) on = i;
                    else if (this.voices[i].timestamp > this.voices[on].timestamp) on = i;
                    channelVoiceCount++;
                    if (channelVoiceCount > maxVoicePerChannel){
                        this.midi_fm_endnote(on);
                        return on;
                    }
                }
            }
            on = -1;
        }*/

        if (on < 0){
            for (var i = 0; i < this.maxVoice; i++){
                if (this.voices[i].channel < 0){
                    return i;
                }
            }
        }

        if (on < 0){
            for (var i = 0; i < this.maxVoice; i++){
                if (this.voices[i].channel == channel){
                    on = i;
                    this.midi_fm_endnote(on);
                    return on;
                }
            }
        }

        if (on < 0){
            for (var i = 0; i < this.maxVoice; i++){
                if (this.voices[i].instrument == this.channels[channel].instrument){
                    on = i;
                    this.midi_fm_endnote(on);
                    return on;
                }
            }
        }

        var now = Date.now();
        if (on < 0){
            var ts = now;
            for (var i = 0; i < this.maxVoice; i++){
                if (this.voices[i].timestamp < ts){
                    ts = this.voices[i].timestamp;
                    on = i;
                }
            }

            if (on >= 0){
                this.midi_fm_endnote(on);
                return on;
            }
        }

        return on;
    },
    midi_write_adlib: function(r, v){
        this.adlib_data[r] = v;

        var a = 0;
        if (r >= 0x100){
            a = 1;
            r -= 0x100;
        }
        this.opl.write(a, r, v);
    },
    midi_fm_instrument: function(voice, inst){
        var modulating = (inst.feedback & 0x01) == 0;
        this.midi_write_adlib(0x23 + this.adlib_opadd[voice], inst.carrierTremolo);
        this.midi_write_adlib(0x43 + this.adlib_opadd[voice], ((inst.carrierKey & 0xc0) | (inst.carrierOutput & 0x3f)) | 0x3f);
        this.midi_write_adlib(0x63 + this.adlib_opadd[voice], inst.carrierAttack);
        this.midi_write_adlib(0x83 + this.adlib_opadd[voice], inst.carrierSustain);
        this.midi_write_adlib(0xe3 + this.adlib_opadd[voice], inst.carrierWaveform);

        this.midi_write_adlib(0x20 + this.adlib_opadd[voice], inst.modulatorTremolo);
        this.midi_write_adlib(0x40 + this.adlib_opadd[voice], modulating
            ? ((inst.modulatorKey & 0xc0) | (inst.modulatorOutput & 0x3f))
            : ((inst.modulatorKey & 0xc0) | (inst.modulatorOutput & 0x3f)) | 0x3f);
        this.midi_write_adlib(0x60 + this.adlib_opadd[voice], inst.modulatorAttack);
        this.midi_write_adlib(0x80 + this.adlib_opadd[voice], inst.modulatorSustain);
        this.midi_write_adlib(0xe0 + this.adlib_opadd[voice], inst.modulatorWaveform);

        var address = voice;
        if (voice > 8) address += 0x100 - 9;
        this.midi_write_adlib(0xc0 + address, inst.feedback | 0x30);
    },
    midi_fm_volume: function(voice, volume){
        var fullVolume = ((this.midi_fm_vol_table[volume] * this.midi_fm_vol_table[this.channels[this.voices[voice].channel].volume] * this.midi_fm_vol_table[127]) / (127 * 127)) | 0;
        var opVolume = 0x3f - this.voices[voice].voice.carrierOutput;
        var regVolume = (0x3f - ((opVolume * fullVolume) / 128) | 0) | this.voices[voice].voice.carrierKey;

        this.midi_write_adlib(0x43 + this.adlib_opadd[voice], regVolume);
        if ((this.voices[voice].voice.feedback & 0x01) != 0){
            this.midi_write_adlib(0x40 + this.adlib_opadd[voice], regVolume);
        }
    },
    midi_fm_playnote: function(voice, note, volume, pitch){
        this.midi_fm_volume(voice, volume);

        var freq;
        var freqIndex = 64 + 32 * note;
        if (freqIndex < 284) freq = this.midi_fm_freq_curve[freqIndex];
        else{
            var subIndex = ((freqIndex - 284) % (12 * 32)) | 0;
            var octave = ((freqIndex - 284) / (12 * 32)) | 0;

            if (octave >= 7){
                if (subIndex < 5){
                    octave = 7;
                }else{
                    octave = 6;
                }
            }

            freq = this.midi_fm_freq_curve[subIndex + 284] | (octave << 10);
        }

        if (pitch) freq += (pitch - 128) >> 1;

        if (voice > this.maxVoiceOn) this.maxVoiceOn = voice;
        var address = voice;
        if (voice > 8) address += 0x100 - 9;
        this.midi_write_adlib(0xa0 + address, freq & 0xff);
        this.midi_write_adlib(0xb0 + address, (freq >> 8) | 0x20);
    },
    midi_fm_endnote: function(voice){
        this.voices[voice] = {
            channel: -1
        };

        var address = voice;
        if (voice > 8) address += 0x100;
        this.midi_write_adlib(0xb0 + address, (this.adlib_data[0xb0 + address] >> 8));
    },
    midi_fm_reset: function(){
        for (var i = 0; i < 512; i++){
            this.midi_write_adlib(i, 0);
        }

        this.midi_write_adlib(0x01, 0x20);
        this.midi_write_adlib(0x08, 0x40);
        this.midi_write_adlib(0x105, 0x01);
        this.midi_write_adlib(0x101, 0x20);
        this.midi_write_adlib(0x108, 0x40);
    },
    midi_fm_vol_table: [
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
    midi_fm_freq_curve: [
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

function MUSChannel(){
    this.instrument = 0;
    this.panning = 0;
    this.volume = 100;
    this.velocity = 0;
    this.pitch = 128;
}
