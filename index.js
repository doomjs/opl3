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
    ConvertTo32Bit: require('pcm-bitdepth-converter').From16To32Bit,
    Normalizer: require('pcm-normalizer'),
    Player: require('./lib/player')
};