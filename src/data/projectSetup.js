export const projectCanvases = Object.freeze({
  duck: Object.freeze({ width: 3600, height: 2400 }),
  boss: Object.freeze({ width: 3600, height: 2400 }),
});

export function canvasLabel(character = "duck") {
  const size = projectCanvases[character] || projectCanvases.duck;
  return `${size.width} × ${size.height} px`;
}
