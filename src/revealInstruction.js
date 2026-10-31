// Keep a readable instruction in place; only recover it when it is above the
// visible reading area. Never return the learner to the top of the whole page.
export function revealInstruction(instruction, navigation) {
  if (!instruction) return;
  const top = instruction.getBoundingClientRect().top;
  const edge =
    Math.max(0, navigation?.getBoundingClientRect().bottom || 0) + 16;
  if (top < edge) window.scrollBy({ top: top - edge, behavior: "instant" });
}
