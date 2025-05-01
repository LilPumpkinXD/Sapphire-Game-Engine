// Sapphire Game Engine (release 1.0.0)
// Audio

async function wave(audioCtx, frequency, noteDuration, { type = 'sine', volume = 0.1, slideToNext = false, nextFrequency = null, slideDuration = 0.05 } = {}) {
    const sampleRate = audioCtx.sampleRate;
    const numberOfSamples = Math.ceil(noteDuration * sampleRate);
    const buffer = audioCtx.createBuffer(1, numberOfSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    const frequencyStart = frequency;
    const frequencyEnd = slideToNext && nextFrequency !== null ? nextFrequency : frequency;

    for (let i = 0; i < numberOfSamples; i++) {
        const time = i / sampleRate;
        let currentFrequency = frequencyStart;
        if (slideToNext && nextFrequency !== null) {
            const progress = time / noteDuration;
            if (progress < 1 - slideDuration / noteDuration) {
                currentFrequency = frequencyStart;
            } else {
                const slideProgress = (progress - (1 - slideDuration / noteDuration)) / (slideDuration / noteDuration);
                currentFrequency = frequencyStart + (frequencyEnd - frequencyStart) * slideProgress;
            }
        }
        let value = 0;
        if (type === 'sine') {
            value = Math.sin(2 * Math.PI * currentFrequency * time);
        } else if (type === 'square') {
            value = Math.sin(2 * Math.PI * currentFrequency * time) >= 0 ? 1 : -1;
        } else if (type === 'sawtooth') {
            value = 2 * (currentFrequency * time - Math.floor(0.5 + currentFrequency * time));
        } else if (type === 'triangle') {
            const period = 1 / currentFrequency;
            const phase = time / period - Math.floor(time / period);
            if (phase < 0.5) {
                value = 2 * phase;
            } else {
                value = 2 * (1 - phase);
            }
        }
        channelData[i] = value * volume;
    }
    return buffer;
}

async function createSnareBuffer(audioCtx, duration, volume = 0.1) {
    const sampleRate = audioCtx.sampleRate;
    const buffer = await wave(audioCtx, 440, duration, { type: 'whiteNoise', volume: volume }); // Still need to handle white noise in wave
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * volume * (1 - i / buffer.length);
    }
    return buffer;
}

function playBuffer(audioCtx, buffer, startTime = 0) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(startTime);
    return source;
}

function waveSequence(sequence, timings, options = {}) {
    let audioCtx;
    let buffers = [];
    let sources = [];
    let isInitialized = false;

    async function initialize() {
        if (!isInitialized) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let currentTime = 0;
            for (let i = 0; i < sequence.length; i++) {
                let buffer;
                if (typeof sequence[i] === 'number') {
                    const nextFrequency = sequence[i + 1] || null;
                    let noteDuration = options.noteDuration;
                    if (options.slideToNext === false) {
                        noteDuration = timings[i];
                    } else if (options.noteDuration === undefined) {
                        noteDuration = timings[i]; // Default to timings if noteDuration is not provided and sliding is enabled
                    }
                    buffer = await wave(audioCtx, sequence[i], noteDuration, { ...options, nextFrequency, slideToNext: options.slideToNext });
                } else if (typeof sequence[i] === 'string' && sequence[i] === 'snare') {
                    buffer = await createSnareBuffer(audioCtx, timings[i], options.volume);
                } else if (sequence[i] instanceof AudioBuffer) {
                    buffer = sequence[i];
                } else {
                    console.warn(`Unknown sequence element at index ${i}: ${sequence[i]}`);
                    continue;
                }
                if (buffer) {
                    buffers.push({ buffer, startTime: currentTime });
                    currentTime += timings[i];
                }
            }
            isInitialized = true;
        }
    }

    const play = async () => {
        if (!isInitialized) {
            await initialize();
        }
        currentTime = audioCtx.currentTime;
        sources = [];
        buffers.forEach(({ buffer, startTime }) => {
            const source = playBuffer(audioCtx, buffer, currentTime + startTime);
            sources.push(source);
        });
    };

    const stop = () => {
        sources.forEach(source => {
            source.stop();
        });
        sources = [];
        if (audioCtx && audioCtx.state === 'running') {
            audioCtx.close();
            audioCtx = null;
            isInitialized = false;
            buffers = [];
        }
    };

    return { play, stop };
}