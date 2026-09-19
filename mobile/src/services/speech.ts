import * as Speech from 'expo-speech';

export async function speak(text: string, onDone?: () => void) {
  try {
    await Speech.stop();
    Speech.speak(text, { rate: 0.95, pitch: 1.0, onDone, onStopped: onDone, onError: onDone });
  } catch (e) {
    console.error('Speech playback failed:', e);
    onDone?.();
  }
}

export async function stopSpeaking() {
  try {
    await Speech.stop();
  } catch (e) {
    console.error('Speech stop failed:', e);
  }
}
