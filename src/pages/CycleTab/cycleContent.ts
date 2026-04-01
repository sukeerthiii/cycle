import type { Phase } from "../../models/types";
import { profile } from "../../models/profile";

const contextMessages: Record<Phase, (day: number) => string> = {
  menstrual: (day) =>
    `Day ${day}. Menstrual. Both hormones are low. Your body is resetting — rest, walk, stretch. The next building window is coming.`,
  follicular: (day) =>
    `Day ${day}. Follicular. Estrogen is rising — your muscles respond better to heavy load right now. Good window to push intensity.`,
  ovulatory: (day) =>
    `Day ${day}. Ovulatory. Estrogen peaks. So does your strength and pain tolerance. This is when your body can handle the most.`,
  luteal: (day) =>
    `Day ${day}. Luteal. Progesterone is climbing. Maintain your strength, don't chase new numbers. Your body is running hotter.`,
};

export function getContextMessage(phase: Phase, day: number): string {
  return contextMessages[phase](day);
}

const nutritionNudges: Record<Phase, string[]> = {
  follicular: [
    `Post-workout protein: paneer, eggs, chicken, moong dal, curd. Target: ${profile.proteinTargetLow}–${profile.proteinTargetHigh}g/day.`,
    "Carb tolerance is high — rice, roti, sweet potato all fuel your lifts well right now.",
    "Soya chunks: 52g protein per 100g. One of the cheapest protein sources you have.",
  ],
  ovulatory: [
    "Insulin sensitivity peaks. Good time for rice-heavy meals around training.",
    "Post-workout: eggs, paneer, chicken. Your MPS response is strongest right now.",
    "Chana (chickpeas): protein + fiber + iron. A good ovulatory staple.",
  ],
  luteal: [
    `Progesterone breaks protein down faster. Aim higher — closer to ${profile.proteinTargetHigh}g. Extra dal, extra curd.`,
    "Craving carbs is real. Poha, upma, idli — carb-heavy snack 3-4h before training helps.",
    "Magnesium: pumpkin seeds, almonds, dark chocolate, palak.",
    "Ragi (finger millet): calcium + iron + protein. Good luteal grain.",
  ],
  menstrual: [
    "Iron: masoor dal, rajma, palak, beetroot, dates, jaggery.",
    "Anti-inflammatory: haldi doodh, ginger, fish, methi seeds.",
    `Protein still matters — don't drop below ${profile.proteinTargetLow}g. Curd, dal, eggs.`,
    "Ghee: anti-inflammatory, calorie-dense, easy to add to anything.",
  ],
};

export function getNutritionNudge(phase: Phase): string {
  const nudges = nutritionNudges[phase];
  const index = Math.floor(Date.now() / 86400000) % nudges.length;
  return nudges[index] ?? nudges[0]!;
}

const scienceSnippets: Record<Phase, string[]> = {
  follicular: [
    "Estrogen increases tendon stiffness — your joints are more stable for heavy squats right now.",
    "Estrogen drives muscle protein synthesis. It's high right now. Use it.",
    "Your nervous system recovers faster in follicular. Heavier loads feel more manageable.",
    "Follicular is your anabolic window — the hormonal equivalent of a green light for heavy lifting.",
  ],
  ovulatory: [
    "Peak estrogen + a small testosterone bump = your strongest window of the cycle.",
    "Pain tolerance is highest at ovulation. You can push through more discomfort safely.",
    "Reaction time peaks mid-cycle. Your coordination is at its best.",
  ],
  luteal: [
    "Your metabolic rate is 5–10% higher in luteal. Burning more at rest, tiring faster in sessions.",
    "Progesterone is catabolic — it breaks down protein faster. Your body needs more protein, not less.",
    "Body temperature rises ~0.3–0.5°C. You'll fatigue faster in cardio and feel warmer during lifts.",
    "Serotonin dips in luteal, which is why cravings spike. Carbs help — they're not the enemy this week.",
  ],
  menstrual: [
    "Iron stores drop during menstruation. Your body prioritizes recovery over output.",
    "Both estrogen and progesterone are at their lowest. Energy, strength, and motivation bottom out — that's physiology, not weakness.",
    "Cortisol spikes from overtraining cause visceral fat storage — rest days keep cortisol low.",
    "Muscle protein synthesis peaks 24–48h after a session. Right now, last week's squats are becoming muscle.",
  ],
};

export function getScienceSnippet(phase: Phase): string {
  const snippets = scienceSnippets[phase];
  const index = Math.floor(Date.now() / 86400000) % snippets.length;
  return snippets[index] ?? snippets[0]!;
}
