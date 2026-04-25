function extractCodes(text) {
  const sequences = text.match(/\d+/g) || [];
  const seen = new Set();
  const codes = [];
  for (const seq of sequences) {
    for (let i = 0; i + 6 <= seq.length; i += 6) {
      const code = seq.slice(i, i + 6);
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }
  return codes;
}
