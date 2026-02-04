
export const speak = (text: string, cancelPrevious = true): void => {
  if ('speechSynthesis' in window) {
    if (cancelPrevious) {
      window.speechSynthesis.cancel();
    }
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-ES';
    msg.rate = 0.85;
    msg.pitch = 1.1;
    window.speechSynthesis.speak(msg);
  }
};
