export function generateResponse(input) {
  const responses = {
    hello: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    time: `Il est ${new Date().toLocaleTimeString()}`,
    joke: "Pourquoi les robots détestent la pluie ? Parce qu'ils rouillent de rire !",
    default: "Je réfléchis à votre question... Veuillez patienter."
  };

  return Object.entries(responses).find(([key]) =>
    input.toLowerCase().includes(key)
  )?.[1] || responses.default;
}
