module.exports = {
    OPL3: require('./lib/opl3'),
    format: {
        LAA: require('./format/laa'),
        MUS: require('./format/mus'),
        DRO: require('./format/dro'),
        IMF: require('./format/imf'),
        RAW: require('./format/raw')
    },
    WAV: require('wav-arraybuffer'),
    ConvertTo32Bit: require('./lib/convertto32bit'),
    Normalizer: require('./lib/normalizer'),
    Player: require('./lib/player')
};