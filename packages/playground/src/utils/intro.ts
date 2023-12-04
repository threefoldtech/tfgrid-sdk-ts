import introJs from "intro.js";
import type { IntroStep } from "intro.js/src/core/steps";
import type { Options } from "intro.js/src/option";
import yaml from "js-yaml";

function wait(time = 1000): Promise<void> {
  return new Promise(res => setTimeout(res, time));
}

export async function startGuide(file: `${string}.yaml` | `${string}.json`) {
  const res = await fetch(`/intro/${file}`);

  let options: Partial<Options>;

  if (file.endsWith(".json")) {
    options = await res.json();
  } else {
    const text = await res.text();
    options = yaml.load(text) as Partial<Options>;
  }

  type Step = IntroStep & { triggerClick?: boolean };

  const steps = options.steps as Step[];

  const intro = introJs().setOptions({
    steps,
    dontShowAgain: import.meta.env.PROD,
    dontShowAgainCookie: file,
    disableInteraction: true,
    exitOnEsc: false,
    exitOnOverlayClick: false,
    showBullets: import.meta.env.DEV,
  });

  intro.onchange(async el => {
    console.log(el);

    const step = steps[intro.currentStep()];
    if (step.triggerClick) {
      el.click();
      step.triggerClick = false;
    }
  });

  await wait(); // to await changes in ui
  return intro.start();
}
