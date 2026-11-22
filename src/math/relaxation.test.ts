import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LECTURE_EXERCISE_1,
  LECTURE_EXERCISE_2_SCRAMBLED,
  buildNormalizedSystemLatex,
  checkDiagonalDominance,
  parseLocaleNumber,
  reorderForDiagonalDominance,
  solveRelaxation,
} from './relaxation';

test('parseLocaleNumber parses decimal dots, commas, negatives, and scientific notation', () => {
  assert.equal(parseLocaleNumber('0.8'), 0.8);
  assert.equal(parseLocaleNumber('0,8'), 0.8);
  assert.equal(parseLocaleNumber(' -1,7 '), -1.7);
  assert.equal(parseLocaleNumber('1e-4'), 1e-4);
  assert.equal(parseLocaleNumber('2,5e-3'), 0.0025);
  assert.equal(parseLocaleNumber('-0'), 0);
  assert.equal(parseLocaleNumber(''), null);
  assert.equal(parseLocaleNumber('abc'), null);
  assert.equal(parseLocaleNumber('1.2.3'), null);
});

test('checkDiagonalDominance identifies strict dominance, non-dominance, and zero diagonals', () => {
  const strict = checkDiagonalDominance(LECTURE_EXERCISE_1.A);
  assert.equal(strict.isStrictlyDominant, true);
  assert.equal(strict.isDominant, true);
  assert.equal(strict.hasZeroDiagonal, false);

  const scrambled = checkDiagonalDominance(LECTURE_EXERCISE_2_SCRAMBLED.A);
  assert.equal(scrambled.isDominant, false);
  assert.equal(scrambled.hasZeroDiagonal, true);
  assert.deepEqual(scrambled.zeroDiagonalRows, [0]);
});

test('reorderForDiagonalDominance permutes scrambled rows and b vector into strict dominance', () => {
  const res = reorderForDiagonalDominance(
    LECTURE_EXERCISE_2_SCRAMBLED.A,
    LECTURE_EXERCISE_2_SCRAMBLED.b
  );
  assert.equal(res.success, true);
  assert.equal(res.changed, true);
  assert.equal(res.achievedStrictDominance, true);
  assert.deepEqual(res.matrixA, [
    [10, 2, -1],
    [1, 10, 2],
    [0, -2, 10],
  ]);
  assert.deepEqual(res.vectorB, [17, -6, 12]);
});

test('solveRelaxation rejects matrices with zero diagonal elements', () => {
  const res = solveRelaxation({
    A: LECTURE_EXERCISE_2_SCRAMBLED.A,
    b: LECTURE_EXERCISE_2_SCRAMBLED.b,
    x0: [0, 0, 0],
    stopMode: 'iterations',
    maxIterations: 3,
    tolerance: 1e-4,
  });
  assert.equal(res.ok, false);
  assert.deepEqual(res.zeroDiagonalRows, [0]);
});

test('solveRelaxation modifies only one variable per step and zeroes the selected residual in the next row', () => {
  const res = solveRelaxation({
    A: LECTURE_EXERCISE_1.A,
    b: LECTURE_EXERCISE_1.b,
    x0: LECTURE_EXERCISE_1.x0,
    stopMode: 'iterations',
    maxIterations: 4,
    tolerance: 1e-4,
  });

  assert.equal(res.ok, true);
  assert.equal(res.iterationsPerformed, 4);
  assert.equal(res.iterations.length, 5); // k = 0, 1, 2, 3, 4

  // Verify single-variable modification and exact residual annihilation at every step
  for (let k = 0; k < 4; k++) {
    const row = res.iterations[k];
    const nextRow = res.iterations[k + 1];
    assert.notEqual(row.updatedVarIndex, null);
    const m = row.updatedVarIndex!;

    // Only component m changes
    for (let i = 0; i < 3; i++) {
      if (i === m) {
        assert.ok(Math.abs(nextRow.x[i] - (row.x[i] + row.residuals[m])) < 1e-12);
      } else {
        assert.equal(nextRow.x[i], row.x[i]);
      }
    }
    // Residual m is annihilated in iteration k+1
    assert.ok(Math.abs(nextRow.residuals[m]) < 1e-12);
  }

  // Close to exact solution [1, -2, 3] after 4 iterations
  assert.ok(Math.abs(res.finalSolution[0] - 1) < 0.01);
  assert.ok(Math.abs(res.finalSolution[1] - -2) < 0.01);
  assert.ok(Math.abs(res.finalSolution[2] - 3) < 0.03);
});

test('solveRelaxation matches exact 3-iteration values for reordered Exercise 2', () => {
  const reordered = reorderForDiagonalDominance(
    LECTURE_EXERCISE_2_SCRAMBLED.A,
    LECTURE_EXERCISE_2_SCRAMBLED.b
  );
  const res = solveRelaxation({
    A: reordered.matrixA,
    b: reordered.vectorB,
    x0: [0, 0, 0],
    stopMode: 'iterations',
    maxIterations: 3,
    tolerance: 1e-4,
  });

  assert.equal(res.ok, true);
  assert.ok(Math.abs(res.finalSolution[0] - 1.7) < 1e-12);
  assert.ok(Math.abs(res.finalSolution[1] - -1.01) < 1e-12);
  assert.ok(Math.abs(res.finalSolution[2] - 1.2) < 1e-12);
  assert.ok(Math.abs(res.finalResiduals[0] - 0.322) < 1e-12);
  assert.equal(res.finalResiduals[1], 0);
  assert.ok(Math.abs(res.finalResiduals[2] - -0.202) < 1e-12);
});

test('solveRelaxation converges under tolerance stop mode and generates clean LaTeX', () => {
  const res = solveRelaxation({
    A: LECTURE_EXERCISE_1.A,
    b: LECTURE_EXERCISE_1.b,
    x0: LECTURE_EXERCISE_1.x0,
    stopMode: 'tolerance',
    maxIterations: 100,
    tolerance: 1e-6,
  });

  assert.equal(res.ok, true);
  assert.equal(res.stopReason, 'tolerance_reached');
  assert.ok(res.finalMaxResidual < 1e-6);
  assert.ok(Math.abs(res.finalSolution[0] - 1) < 1e-5);
  assert.ok(Math.abs(res.finalSolution[1] - -2) < 1e-5);
  assert.ok(Math.abs(res.finalSolution[2] - 3) < 1e-5);

  const latex = buildNormalizedSystemLatex(res.normalized!, 4);
  assert.ok(latex.includes('R_{1} = -x_{1} - 0.3\\,x_{2} - 0.1\\,x_{3} + 0.7 = 0'));
  assert.ok(latex.includes('R_{3} = -0.05\\,x_{1} - 0.1\\,x_{2} - x_{3} + 2.85 = 0'));
});
