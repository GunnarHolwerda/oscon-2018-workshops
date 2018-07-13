/* eslint-env browser */
export default (src, initialCount = 5) => {
  const ready = new Set();
  const newInstance = () => {
    const sound = new Audio(src);
    sound.addEventListener('ended', () => {
      ready.add(sound);
    });
    return sound;
  };

  Array(initialCount).fill().forEach(() => ready.add(newInstance()));

  return () => {
    const sound = [...ready][0] || newInstance();
    ready.delete(sound);
    sound.play();
  };
};
