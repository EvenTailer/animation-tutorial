export const projectCanvases = Object.freeze({
  duck: Object.freeze({ width: 2400, height: 3200 }),
  boss: Object.freeze({ width: 2400, height: 3600 }),
});

export function canvasLabel(character = "duck") {
  const size = projectCanvases[character] || projectCanvases.duck;
  return `${size.width} × ${size.height} px`;
}
