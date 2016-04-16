module.exports.WAV = function WAV(data, sampleRate){
    var buffer = new Uint8Array(data.length + 44);

    var blockAlign = (2 * 16) >> 3;
    var byteRate = blockAlign * sampleRate;
    var subChunk2Size = data.length * (16 >> 3) / 2;
    var chunkSize = 36 + subChunk2Size;

    //RIFF
    buffer[0] = 0x52;
    buffer[1] = 0x49;
    buffer[2] = 0x46;
    buffer[3] = 0x46;

    buffer[4] = chunkSize & 0xff;
    buffer[5] = (chunkSize >> 8) & 0xff;
    buffer[6] = (chunkSize >> 16) & 0xff;
    buffer[7] = (chunkSize >> 24) & 0xff;

    //WAVE
    buffer[8] = 0x57;
    buffer[9] = 0x41;
    buffer[10] = 0x56;
    buffer[11] = 0x45;

    //fmt
    buffer[12] = 0x66;
    buffer[13] = 0x6d;
    buffer[14] = 0x74;
    buffer[15] = 0x20;

    //SubChunk1Size
    buffer[16] = 16;
    buffer[17] = 0;
    buffer[18] = 0;
    buffer[19] = 0;

    //audio format
    buffer[20] = 1;
    buffer[21] = 0;

    //num channels
    buffer[22] = 2;
    buffer[23] = 0;

    buffer[24] = sampleRate & 0xff;
    buffer[25] = (sampleRate >> 8) & 0xff;
    buffer[26] = (sampleRate >> 16) & 0xff;
    buffer[27] = (sampleRate >> 24) & 0xff;

    buffer[28] = byteRate & 0xff;
    buffer[29] = (byteRate >> 8) & 0xff;
    buffer[30] = (byteRate >> 16) & 0xff;
    buffer[31] = (byteRate >> 24) & 0xff;

    buffer[32] = blockAlign & 0xff;
    buffer[33] = (blockAlign >> 8) & 0xff;

    //bitsPerSample
    buffer[34] = 16;
    buffer[35] = 0;

    //data
    buffer[36] = 0x64;
    buffer[37] = 0x61;
    buffer[38] = 0x74;
    buffer[39] = 0x61;

    buffer[40] = subChunk2Size & 0xff;
    buffer[41] = (subChunk2Size >> 8) & 0xff;
    buffer[42] = (subChunk2Size >> 16) & 0xff;
    buffer[43] = (subChunk2Size >> 24) & 0xff;

    buffer.set(data, 44);

	return buffer;
}
