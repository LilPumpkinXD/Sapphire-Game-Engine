// Sapphire Game Engine
// release 1.0.0

// Rendering:
// pixel(x, y, color) - Draws a pixel at (x, y) with the specified color.
// rect(x, y, width, height, color) - Draws a rectangle at (x, y) with the specified width, height, and color.
// text(text, x, y, color, centered (true or false, centers text)) - Draws the specified text at (x, y) with the specified color.
// clear(opacity) - Clears the canvas with the specified opacity (0 to 1).

// Audio:
// const myWaveSequence = waveSequence(sequence, timings, options) - Plays a sequence of audio buffers with the provided sequence and timings.
// myWaveSequence.play() - Plays the audio sequence.

// Parameters:
// noteDuration: intager - Duration of each note in seconds.
// volume: float - Volume of the audio (0 to 1).

// Beta Features:
// slideToNext: boolean - If true, slides to the next note frequency.
// slideDuration: intager - Duration of the slide in seconds.



// Audio Example:
let Playing = false;
const myWaveSequence = waveSequence(
    [440, 660, 400, 880, 440, 660, 440, 244], // Frequencies for each note in Hertz.
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25], // Timings for each note in seconds.
    {type: 'square', volume: 0.5 } // Parameters for the wave sequence.
);
function main() {
    if (keys["Enter"] == true && Playing == false) { // Check if key "A" is pressed.
        Playing = true;
        myWaveSequence.play();
    }
    requestAnimationFrame(main);
}
main();
