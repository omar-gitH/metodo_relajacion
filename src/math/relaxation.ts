export type StopMode = 'iterations' | 'tolerance';

export interface RowDominanceDetail {
  rowIndex: number;
  diagonalAbs: number;
  offDiagonalSum: number;
  isZeroDiagonal: boolean;
  isWeaklyDominant: boolean;
  isStrictlyDominant: boolean;
}

export interface DiagonalDominanceReport {
  isDominant: boolean;
  isStrictlyDominant: boolean;
  hasZeroDiagonal: boolean;
  zeroDiagonalRows: number[]; // 0-indexed
  rowDetails: RowDominanceDetail[];
}

export interface ReorderResult {
  success: boolean;
  changed: boolean;
  permutation: number[]; // newRowIndex -> oldRowIndex
  matrixA: number[][];
  vectorB: number[];
  achievedStrictDominance: boolean;
  achievedWeakDominance: boolean;
  message: string;
}

export interface NormalizedSystem {
  B: number[][]; // B[i][i] = -1, B[i][j] = -a_ij / a_ii for i != j
  c: number[]; // c[i] = b_i / a_ii
}

export interface IterationRow {
  k: number;
  x: number[];
  residuals: number[];
  maxResidualIndex: number; // 0-indexed variable m with max |R_m|
  maxResidualAbs: number;
  deltaApplied: number | null; // null on final summary row
  updatedVarIndex: number | null; // null on final summary row
  updatedNewValue: number | null; // x_m^(k+1)
}

export interface VerificationRow {
  index: number;
  xInitial: number;
  xFinal: number;
  axFinal: number;
  bTarget: number;
  absDiff: number;
  finalResidual: number;
}

export interface RelaxationInput {
  A: number[][];
  b: number[];
  x0: number[];
  stopMode: StopMode;
  maxIterations: number;
  tolerance: number;
}

export interface RelaxationResult {
  ok: boolean;
  error?: string;
  zeroDiagonalRows?: number[];
  normalized?: NormalizedSystem;
  iterations: IterationRow[];
  finalSolution: number[];
  finalResiduals: number[];
  finalMaxResidual: number;
  iterationsPerformed: number;
  stopReason: 'fixed_iterations' | 'tolerance_reached' | 'max_cap_reached' | 'diverged' | 'exact_zero';
  dominance: DiagonalDominanceReport;
  verification: VerificationRow[];
}

export const LECTURE_EXERCISE_1 = {
  n: 3,
  A: [
    [10, 3, 1],
    [2, 15, 4],
    [1, 2, 20],
  ],
  b: [7, -16, 57],
  x0: [0.8, -1.7, 2.5],
  exactSolution: [1, -2, 3],
};

export const LECTURE_EXERCISE_2_SCRAMBLED = {
  n: 3,
  A: [
    [0, -2, 10],
    [10, 2, -1],
    [1, 10, 2],
  ],
  b: [12, 17, -6],
  x0: [0, 0, 0],
  exactSolution: [2, -1, 1],
};

/**
 * Parses numeric input accepting either '.' or ',' as decimal separator.
 * Returns null if the string is empty or not a valid finite real number.
 */
export function parseLocaleNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  // Normalize comma decimal separator (support inputs like "-1,7" or "1e-4")
  const normalized = trimmed.replace(/\s+/g, '').replace(',', '.');
  // Reject multiple dots or invalid trailing characters
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(normalized)) {
    return null;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Object.is(value, -0) ? 0 : value;
}

/**
 * Formats a number with fixed decimal precision, eliminating "-0.0000" artifacts.
 */
export function formatFixed(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return 'NaN';
  const threshold = Math.pow(10, -(decimals + 2));
  const clean = Math.abs(value) < threshold ? 0 : value;
  const formatted = clean.toFixed(decimals);
  return formatted === `-${(0).toFixed(decimals)}` ? (0).toFixed(decimals) : formatted;
}

/**
 * Formats a coefficient concisely for LaTeX equations, trimming redundant trailing zeros.
 */
export function formatCoefLatex(value: number, decimals: number): string {
  const fixed = formatFixed(value, decimals);
  if (!fixed.includes('.')) return fixed;
  const trimmed = fixed.replace(/\.?0+$/, '');
  return trimmed === '-0' || trimmed === '' ? '0' : trimmed;
}

/**
 * Evaluates diagonal dominance and detects zero entries on the main diagonal.
 */
export function checkDiagonalDominance(A: number[][]): DiagonalDominanceReport {
  const n = A.length;
  const zeroDiagonalRows: number[] = [];
  const rowDetails: RowDominanceDetail[] = [];

  let allWeak = true;
  let allStrict = true;
  let atLeastOneStrict = false;

  for (let i = 0; i < n; i++) {
    const diag = Math.abs(A[i][i]);
    let offSum = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        offSum += Math.abs(A[i][j]);
      }
    }
    const isZeroDiagonal = diag === 0;
    if (isZeroDiagonal) {
      zeroDiagonalRows.push(i);
    }
    const eps = 1e-12;
    const isWeaklyDominant = !isZeroDiagonal && diag + eps >= offSum;
    const isStrictlyDominant = !isZeroDiagonal && diag > offSum + eps;

    if (!isWeaklyDominant) allWeak = false;
    if (!isStrictlyDominant) allStrict = false;
    if (isStrictlyDominant) atLeastOneStrict = true;

    rowDetails.push({
      rowIndex: i,
      diagonalAbs: diag,
      offDiagonalSum: offSum,
      isZeroDiagonal,
      isWeaklyDominant,
      isStrictlyDominant,
    });
  }

  return {
    isDominant: n > 0 && allWeak && (atLeastOneStrict || n === 1),
    isStrictlyDominant: n > 0 && allStrict,
    hasZeroDiagonal: zeroDiagonalRows.length > 0,
    zeroDiagonalRows,
    rowDetails,
  };
}

/**
 * Finds the best row permutation to achieve diagonal dominance (or eliminate zero diagonals).
 * Uses exact search for n <= 8 (n! <= 40,320, with pruning it executes in < 2ms).
 */
export function reorderForDiagonalDominance(
  A: number[][],
  b: number[]
): ReorderResult {
  const n = A.length;
  const identity = Array.from({ length: n }, (_, i) => i);

  // Precompute dominance metrics if original row r is placed at target position pos
  const rowTotalAbs = A.map((row) => row.reduce((acc, v) => acc + Math.abs(v), 0));

  // For each target position pos, collect valid candidate rows
  const strictCandidates: number[][] = Array.from({ length: n }, () => []);
  const weakCandidates: number[][] = Array.from({ length: n }, () => []);
  const nonZeroCandidates: number[][] = Array.from({ length: n }, () => []);

  const eps = 1e-12;
  for (let pos = 0; pos < n; pos++) {
    for (let r = 0; r < n; r++) {
      const diag = Math.abs(A[r][pos]);
      const offSum = rowTotalAbs[r] - diag;
      if (diag > 0) {
        nonZeroCandidates[pos].push(r);
        if (diag + eps >= offSum) {
          weakCandidates[pos].push(r);
        }
        if (diag > offSum + eps) {
          strictCandidates[pos].push(r);
        }
      }
    }
    // Sort candidates by margin descending for faster pruning
    const byMargin = (r1: number, r2: number) => {
      const m1 = 2 * Math.abs(A[r1][pos]) - rowTotalAbs[r1];
      const m2 = 2 * Math.abs(A[r2][pos]) - rowTotalAbs[r2];
      return m2 - m1;
    };
    strictCandidates[pos].sort(byMargin);
    weakCandidates[pos].sort(byMargin);
    nonZeroCandidates[pos].sort(byMargin);
  }

  function findMatching(candidates: number[][]): number[] | null {
    const used = new Array<boolean>(n).fill(false);
    const perm = new Array<number>(n).fill(-1);
    // Order positions by fewest candidates first (MRV heuristic)
    const order = Array.from({ length: n }, (_, i) => i).sort(
      (p1, p2) => candidates[p1].length - candidates[p2].length
    );

    function dfs(step: number): boolean {
      if (step === n) return true;
      const pos = order[step];
      for (const r of candidates[pos]) {
        if (!used[r]) {
          used[r] = true;
          perm[pos] = r;
          if (dfs(step + 1)) return true;
          used[r] = false;
          perm[pos] = -1;
        }
      }
      return false;
    }

    return dfs(0) ? perm : null;
  }

  // Tier 1: Strict diagonal dominance on every row
  let chosenPerm = findMatching(strictCandidates);
  let achievedStrict = false;
  let achievedWeak = false;

  if (chosenPerm) {
    achievedStrict = true;
    achievedWeak = true;
  } else {
    // Tier 2: Weak diagonal dominance (with at least one strict if possible)
    chosenPerm = findMatching(weakCandidates);
    if (chosenPerm) {
      achievedWeak = true;
    } else {
      // Tier 3: Best permutation with non-zero diagonal maximizing dominance score
      // Use DFS with branch-and-bound on non-zero candidates
      const used = new Array<boolean>(n).fill(false);
      const perm = new Array<number>(n).fill(-1);
      let bestPerm: number[] | null = null;
      let bestScore = -Infinity;

      const order = Array.from({ length: n }, (_, i) => i).sort(
        (p1, p2) => nonZeroCandidates[p1].length - nonZeroCandidates[p2].length
      );

      // Compute upper bound remaining margin per step for pruning
      const maxPosRatio = order.map((pos) => {
        let m = -Infinity;
        for (const r of nonZeroCandidates[pos]) {
          const denom = rowTotalAbs[r] || 1;
          const score = (2 * Math.abs(A[r][pos]) - rowTotalAbs[r]) / denom;
          if (score > m) m = score;
        }
        return m === -Infinity ? -1 : m;
      });
      const suffixMax = new Array<number>(n + 1).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        suffixMax[i] = suffixMax[i + 1] + maxPosRatio[i];
      }

      let nodesVisited = 0;
      const MAX_NODES = 25000;

      function searchBest(step: number, currentScore: number) {
        if (nodesVisited++ > MAX_NODES) return;
        if (currentScore + suffixMax[step] <= bestScore) return;
        if (step === n) {
          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestPerm = perm.slice();
          }
          return;
        }
        const pos = order[step];
        for (const r of nonZeroCandidates[pos]) {
          if (!used[r]) {
            used[r] = true;
            perm[pos] = r;
            const denom = rowTotalAbs[r] || 1;
            const ratio = (2 * Math.abs(A[r][pos]) - rowTotalAbs[r]) / denom;
            searchBest(step + 1, currentScore + ratio);
            used[r] = false;
            perm[pos] = -1;
          }
        }
      }

      searchBest(0, 0);
      chosenPerm = bestPerm;
    }
  }

  if (!chosenPerm) {
    return {
      success: false,
      changed: false,
      permutation: identity,
      matrixA: A.map((r) => r.slice()),
      vectorB: b.slice(),
      achievedStrictDominance: false,
      achievedWeakDominance: false,
      message:
        'No existe ninguna permutación de filas que elimine todos los ceros de la diagonal principal (matriz estructuralmente singular).',
    };
  }

  const changed = chosenPerm.some((oldIdx, newIdx) => oldIdx !== newIdx);
  const newA = chosenPerm.map((oldIdx) => A[oldIdx].slice());
  const newB = chosenPerm.map((oldIdx) => b[oldIdx]);
  const postReport = checkDiagonalDominance(newA);

  let message: string;
  if (!changed && postReport.isStrictlyDominant) {
    message = 'El sistema ya se encuentra ordenado con dominancia diagonal estricta.';
  } else if (postReport.isStrictlyDominant) {
    message = 'Filas permutadas con éxito: el sistema ahora es estrictamente diagonalmente dominante.';
  } else if (postReport.isDominant) {
    message = 'Filas permutadas con éxito: el sistema cumple con dominancia diagonal.';
  } else if (changed) {
    message =
      'Se permutaron las filas para maximizar la diagonal y evitar ceros, aunque la matriz no admite dominancia diagonal completa.';
  } else {
    message =
      'No existe permutación que haga la matriz diagonalmente dominante; se conserva la disposición actual.';
  }

  return {
    success: true,
    changed,
    permutation: chosenPerm,
    matrixA: newA,
    vectorB: newB,
    achievedStrictDominance: postReport.isStrictlyDominant,
    achievedWeakDominance: postReport.isDominant,
    message,
  };
}

/**
 * Normalizes A*x = b into -x_i + sum_{j!=i} b_ij * x_j + c_i = 0 by dividing row i by -a_ii.
 */
export function normalizeSystem(A: number[][], b: number[]): NormalizedSystem {
  const n = A.length;
  const B: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const c: number[] = new Array<number>(n).fill(0);

  for (let i = 0; i < n; i++) {
    const aii = A[i][i];
    if (aii === 0) {
      throw new Error(`Zero diagonal element at row ${i + 1}`);
    }
    for (let j = 0; j < n; j++) {
      if (i === j) {
        B[i][j] = -1;
      } else {
        const val = -A[i][j] / aii;
        B[i][j] = Object.is(val, -0) ? 0 : val;
      }
    }
    const ci = b[i] / aii;
    c[i] = Object.is(ci, -0) ? 0 : ci;
  }

  return { B, c };
}

/**
 * Computes residual vector R_i = c_i - x_i + sum_{j != i} b_ij * x_j = c_i + sum_j B_ij * x_j.
 */
export function computeResiduals(normalized: NormalizedSystem, x: number[]): number[] {
  const n = normalized.c.length;
  const residuals = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = normalized.c[i];
    for (let j = 0; j < n; j++) {
      sum += normalized.B[i][j] * x[j];
    }
    residuals[i] = Math.abs(sum) < 1e-14 ? 0 : sum;
  }
  return residuals;
}

/**
 * Runs the Relaxation iterative method on A*x = b starting from x0.
 */
export function solveRelaxation(input: RelaxationInput): RelaxationResult {
  const { A, b, x0, stopMode, maxIterations, tolerance } = input;
  const n = A.length;
  const dominance = checkDiagonalDominance(A);

  if (dominance.hasZeroDiagonal) {
    const rowsList = dominance.zeroDiagonalRows.map((r) => `a_{${r + 1}${r + 1}} = 0`).join(', ');
    return {
      ok: false,
      error: `No es posible normalizar el sistema: existen elementos nulos en la diagonal principal (${rowsList}). Reordene las ecuaciones o corrija los coeficientes antes de aplicar el método.`,
      zeroDiagonalRows: dominance.zeroDiagonalRows,
      iterations: [],
      finalSolution: x0.slice(),
      finalResiduals: [],
      finalMaxResidual: Infinity,
      iterationsPerformed: 0,
      stopReason: 'fixed_iterations',
      dominance,
      verification: [],
    };
  }

  const normalized = normalizeSystem(A, b);
  const currentX = x0.slice();
  const iterations: IterationRow[] = [];

  const hardCap = stopMode === 'iterations'
    ? Math.max(1, Math.min(200, Math.floor(maxIterations)))
    : Math.max(1, Math.min(500, Math.floor(maxIterations || 200)));

  const eps = Math.max(1e-15, tolerance);
  let stopReason: RelaxationResult['stopReason'] =
    stopMode === 'iterations' ? 'fixed_iterations' : 'max_cap_reached';

  let k = 0;
  while (true) {
    const residuals = computeResiduals(normalized, currentX);

    // Find index m with max |R_i| (deterministic tie-break: first index)
    let maxIdx = 0;
    let maxAbs = Math.abs(residuals[0]);
    for (let i = 1; i < n; i++) {
      const absVal = Math.abs(residuals[i]);
      if (absVal > maxAbs + 1e-15) {
        maxAbs = absVal;
        maxIdx = i;
      }
    }

    // Check divergence safeguard
    if (!Number.isFinite(maxAbs) || maxAbs > 1e12) {
      iterations.push({
        k,
        x: currentX.slice(),
        residuals,
        maxResidualIndex: maxIdx,
        maxResidualAbs: maxAbs,
        deltaApplied: null,
        updatedVarIndex: null,
        updatedNewValue: null,
      });
      stopReason = 'diverged';
      break;
    }

    // Check stop condition BEFORE applying another relaxation step
    if (stopMode === 'iterations' && k >= hardCap) {
      iterations.push({
        k,
        x: currentX.slice(),
        residuals,
        maxResidualIndex: maxIdx,
        maxResidualAbs: maxAbs,
        deltaApplied: null,
        updatedVarIndex: null,
        updatedNewValue: null,
      });
      stopReason = 'fixed_iterations';
      break;
    }

    if (stopMode === 'tolerance' && maxAbs < eps) {
      iterations.push({
        k,
        x: currentX.slice(),
        residuals,
        maxResidualIndex: maxIdx,
        maxResidualAbs: maxAbs,
        deltaApplied: null,
        updatedVarIndex: null,
        updatedNewValue: null,
      });
      stopReason = maxAbs === 0 ? 'exact_zero' : 'tolerance_reached';
      break;
    }

    if (maxAbs < 1e-15) {
      iterations.push({
        k,
        x: currentX.slice(),
        residuals,
        maxResidualIndex: maxIdx,
        maxResidualAbs: 0,
        deltaApplied: null,
        updatedVarIndex: null,
        updatedNewValue: null,
      });
      stopReason = 'exact_zero';
      break;
    }

    if (k >= hardCap) {
      iterations.push({
        k,
        x: currentX.slice(),
        residuals,
        maxResidualIndex: maxIdx,
        maxResidualAbs: maxAbs,
        deltaApplied: null,
        updatedVarIndex: null,
        updatedNewValue: null,
      });
      stopReason = 'max_cap_reached';
      break;
    }

    // Apply single-variable relaxation: x_m^(k+1) = x_m^(k) + R_m^(k)
    const delta = residuals[maxIdx];
    const newVal = currentX[maxIdx] + delta;

    iterations.push({
      k,
      x: currentX.slice(),
      residuals,
      maxResidualIndex: maxIdx,
      maxResidualAbs: maxAbs,
      deltaApplied: delta,
      updatedVarIndex: maxIdx,
      updatedNewValue: newVal,
    });

    currentX[maxIdx] = newVal;
    k += 1;
  }

  const lastRow = iterations[iterations.length - 1];
  const finalSolution = lastRow.x.slice();
  const finalResiduals = lastRow.residuals.slice();
  const finalMaxResidual = lastRow.maxResidualAbs;

  // Build verification table A*x^(K) vs b and comparison with x^(0)
  const verification: VerificationRow[] = [];
  for (let i = 0; i < n; i++) {
    let ax = 0;
    for (let j = 0; j < n; j++) {
      ax += A[i][j] * finalSolution[j];
    }
    verification.push({
      index: i,
      xInitial: x0[i],
      xFinal: finalSolution[i],
      axFinal: ax,
      bTarget: b[i],
      absDiff: Math.abs(ax - b[i]),
      finalResidual: finalResiduals[i],
    });
  }

  return {
    ok: true,
    normalized,
    iterations,
    finalSolution,
    finalResiduals,
    finalMaxResidual,
    iterationsPerformed: lastRow.k,
    stopReason,
    dominance,
    verification,
  };
}

/**
 * Generates a clean LaTeX cases block for the normalized residual equations:
 * R_i = -x_i + sum b_ij x_j + c_i = 0
 */
export function buildNormalizedSystemLatex(
  normalized: NormalizedSystem,
  decimals: number
): string {
  const n = normalized.c.length;
  const lines: string[] = [];

  for (let i = 0; i < n; i++) {
    const terms: string[] = [];
    for (let j = 0; j < n; j++) {
      const coef = normalized.B[i][j];
      const absCoef = Math.abs(coef);
      if (absCoef < Math.pow(10, -(decimals + 3))) continue;

      const isFirst = terms.length === 0;
      const sign = coef < 0 ? '-' : isFirst ? '' : '+';
      const isUnit = Math.abs(absCoef - 1) < 1e-12;
      const coefStr = isUnit ? '' : `${formatCoefLatex(absCoef, decimals)}\\,`;

      if (isFirst) {
        terms.push(`${sign}${coefStr}x_{${j + 1}}`);
      } else {
        terms.push(`${sign} ${coefStr}x_{${j + 1}}`);
      }
    }

    const ci = normalized.c[i];
    if (Math.abs(ci) >= Math.pow(10, -(decimals + 3))) {
      const cSign = ci < 0 ? '-' : terms.length === 0 ? '' : '+';
      const cStr = formatCoefLatex(Math.abs(ci), decimals);
      terms.push(terms.length === 0 ? `${cSign}${cStr}` : `${cSign} ${cStr}`);
    } else if (terms.length === 0) {
      terms.push('0');
    }

    lines.push(`R_{${i + 1}} = ${terms.join(' ')} = 0`);
  }

  return `\\begin{cases} ${lines.join(' \\\\[4pt] ')} \\end{cases}`;
}
