// Biomechanical plate combination solver tailored for adjustable dumbbells with sleeve capacity limits

export interface DumbbellConfig {
  handleWeightKg: number;
  availablePlateDenominations: number[]; // e.g. [2.5, 2.0, 1.5]
  maxPlatesPerSleeve: number; // e.g. 5
}

export interface DumbbellLoadSolution {
  targetWeightKg: number;
  actualWeightKg: number;
  isExact: boolean;
  platesPerSide: number[];
  plateCounts: Record<number, number>;
  totalPlatesPerSide: number;
  maxPlatesPerSleeve: number;
  exceedsCapacity: boolean;
  message: string;
}

export const DEFAULT_DUMBBELL_CONFIG: DumbbellConfig = {
  handleWeightKg: 2,
  availablePlateDenominations: [2.5, 2.0, 1.5],
  maxPlatesPerSleeve: 5
};

// Generates all possible valid dumbbell loads given the sleeve capacity and plate types
export function generateAllAchievableDumbbellLoads(
  config: DumbbellConfig = DEFAULT_DUMBBELL_CONFIG
): Map<number, number[]> {
  const { handleWeightKg, availablePlateDenominations, maxPlatesPerSleeve } = config;
  const sortedDenoms = [...availablePlateDenominations].sort((a, b) => b - a);
  const weightToCombo = new Map<number, number[]>();

  // Add bodyweight (0kg) and bare handle
  weightToCombo.set(0, []);
  weightToCombo.set(handleWeightKg, []);

  function backtrack(index: number, currentCombo: number[], currentSum: number) {
    if (currentCombo.length > maxPlatesPerSleeve) return;

    if (currentCombo.length > 0) {
      const totalWeight = Math.round((handleWeightKg + currentSum * 2) * 10) / 10;
      if (!weightToCombo.has(totalWeight) || currentCombo.length < weightToCombo.get(totalWeight)!.length) {
        weightToCombo.set(totalWeight, [...currentCombo]);
      }
    }

    if (currentCombo.length === maxPlatesPerSleeve) return;

    for (let i = index; i < sortedDenoms.length; i++) {
      currentCombo.push(sortedDenoms[i]);
      backtrack(i, currentCombo, currentSum + sortedDenoms[i]);
      currentCombo.pop();
    }
  }

  backtrack(0, [], 0);
  return weightToCombo;
}

export function solveDumbbellLoad(
  targetWeightKg: number,
  config: DumbbellConfig = DEFAULT_DUMBBELL_CONFIG
): DumbbellLoadSolution {
  const { handleWeightKg, maxPlatesPerSleeve } = config;
  const allLoads = generateAllAchievableDumbbellLoads(config);
  const sortedWeights = Array.from(allLoads.keys()).sort((a, b) => a - b);

  // Clean rounding
  const roundedTarget = Math.round(targetWeightKg * 10) / 10;

  // Direct exact match found
  if (allLoads.has(roundedTarget)) {
    const plates = allLoads.get(roundedTarget)!;
    const plateCounts: Record<number, number> = {};
    plates.forEach((p) => {
      plateCounts[p] = (plateCounts[p] || 0) + 1;
    });

    return {
      targetWeightKg: roundedTarget,
      actualWeightKg: roundedTarget,
      isExact: true,
      platesPerSide: plates,
      plateCounts,
      totalPlatesPerSide: plates.length,
      maxPlatesPerSleeve,
      exceedsCapacity: false,
      message: `Exact match: ${plates.length}/${maxPlatesPerSleeve} plates per sleeve.`
    };
  }

  // If outside range or not exact, find closest achievable weight
  let closestWeight = sortedWeights[0];
  let minDiff = Math.abs(roundedTarget - closestWeight);

  for (const w of sortedWeights) {
    const diff = Math.abs(roundedTarget - w);
    if (diff < minDiff) {
      minDiff = diff;
      closestWeight = w;
    }
  }

  const plates = allLoads.get(closestWeight) || [];
  const plateCounts: Record<number, number> = {};
  plates.forEach((p) => {
    plateCounts[p] = (plateCounts[p] || 0) + 1;
  });

  const maxPossible = sortedWeights[sortedWeights.length - 1];
  const exceedsCapacity = roundedTarget > maxPossible;

  let message = `Closest valid load is ${closestWeight}kg (${plates.length}/${maxPlatesPerSleeve} plates/side).`;
  if (exceedsCapacity) {
    message = `Exceeds sleeve limit (${maxPlatesPerSleeve} plates/side max). Capped at ${maxPossible}kg.`;
  }

  return {
    targetWeightKg: roundedTarget,
    actualWeightKg: closestWeight,
    isExact: false,
    platesPerSide: plates,
    plateCounts,
    totalPlatesPerSide: plates.length,
    maxPlatesPerSleeve,
    exceedsCapacity,
    message
  };
}
