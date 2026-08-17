# iOS Safari duplex audio note

Bebop Reader needs simultaneous Web Audio playback and microphone capture. On iPhone Safari, `getUserMedia({audio:true})` can recategorize the native audio session and change output routing/volume.

The v0.9 session therefore uses this startup sequence:

1. Resume/create the shared AudioContext.
2. Reset `navigator.audioSession.type` to `auto` when available.
3. Acquire the microphone.
4. Set `navigator.audioSession.type = 'play-and-record'` after capture starts.
5. Attach the microphone analyser and reassert `play-and-record`.
6. Resume/check the AudioContext again.
7. Only then schedule count-in, groove, Teacher Call, and Answer Echo nodes.

The groove click uses the same oscillator/gain function as the audible count-in, so a device that hears count-in but not the post-count pulse now points to OS routing/session behavior rather than two different synthesis implementations.

On session teardown the code requests `playback` and then `auto` to restore the normal output category.
