// Converts text smileys to Unicode emojis at render time.
// Applied client-side only — the original text is never modified in storage.

const SMILEY_MAP: [RegExp, string][] = [
  [/>:-\(/g, '\u{1F620}'], // >:-(
  [/>:\(/g, '\u{1F620}'],  // >:(
  [/:-D/g, '\u{1F604}'],   // :-D
  [/:D/g, '\u{1F604}'],    // :D
  [/xD/gi, '\u{1F604}'],   // xD / XD
  [/;-\)/g, '\u{1F609}'],  // ;-)
  [/;\)/g, '\u{1F609}'],   // ;)
  [/:-\)/g, '\u{1F642}'],  // :-)
  [/:\)/g, '\u{1F642}'],   // :)
  [/:-P/gi, '\u{1F61B}'],  // :-P / :-p
  [/:P/gi, '\u{1F61B}'],   // :P / :p
  [/:-O/gi, '\u{1F62E}'],  // :-O / :-o
  [/:O/gi, '\u{1F62E}'],   // :O / :o
  [/:'?\(/g, '\u{1F622}'], // :'( or :(
  [/:-\(/g, '\u{1F61E}'],  // :-(
  [/<3/g, '\u2764\uFE0F']  // <3
]

export function convertSmileys(text: string): string {
  let result = text
  for (const [pattern, emoji] of SMILEY_MAP) {
    result = result.replace(pattern, emoji)
  }
  return result
}
