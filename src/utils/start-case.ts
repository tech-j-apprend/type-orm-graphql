/**
 * this method considers characters different than letters or numbers, and splits them into words,
 * then each word is transformed into uppercase.
 * @param inputString the sting to be converted
 * @returns a string containing the formatted character start capitalized
 */
export function toStartCase(inputString: string) {
  const words = inputString.split(/([^A-Za-z0-9]+)/);

  const formattedWords = words.map((word) => {
    return word.replace(/^\w/, (c) => c.toUpperCase());
  });

  return formattedWords.join("");
}
