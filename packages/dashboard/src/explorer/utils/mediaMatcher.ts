/**
 * @description
 *
 * How this accutally working ?
 * Basically vue prefixes every object in a `component` data with a `{__obv__: Observer}`
 * this observer is used to detect changes byRef and reflects these changes into ui.
 *
 * So using this __obv__ its easy to change a value by ref and wait for component update.
 */
export default function mediaMatcher(query: string) {
  const media = window.matchMedia(query);

  const ref = {
    matches: media.matches,
    destry: () => {
      media.onchange = null;
    },
  };

  media.onchange = e => {
    ref.matches = e.matches;
  };

  return ref;
}
