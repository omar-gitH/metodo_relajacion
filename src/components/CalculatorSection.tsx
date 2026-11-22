import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eraser,
  XCircle,
} from 'lucide-react';
import {
  LECTURE_EXERCISE_1,
  RelaxationResult,
  StopMode,
  buildNormalizedSystemLatex,
  checkDiagonalDominance,
  formatFixed,
  parseLocaleNumber,
  reorderForDiagonalDominance,
  solveRelaxation,
} from '../math/relaxation';
import { MathTex } from './MathTex';
import type { ExercisePreset } from './ExercisesSection';

interface CalculatorSectionProps {
  externalPreset: { preset: ExercisePreset; nonce: number } | null;
}

function toStringMatrix(A: number[][]): string[][] {
  return A.map((row) => row.map((val) => String(val)));
}

function toStringVector(v: number[]): string[] {
  return v.map((val) => String(val));
}

function createEmptyGrid(n: number) {
  return {
    A: Array.from({ length: n }, () => Array.from({ length: n }, () => '')),
    b: Array.from({ length: n }, () => ''),
    x0: Array.from({ length: n }, () => '0'),
  };
}

function resizeGrid(
  prevA: string[][],
  prevB: string[],
  prevX0: string[],
  nextN: number
) {
  const newA: string[][] = Array.from({ length: nextN }, (_, i) =>
    Array.from({ length: nextN }, (_, j) => {
      if (i < prevA.length && j < prevA[i].length) return prevA[i][j];
      return i === j ? '1' : '0';
    })
  );
  const newB: string[] = Array.from({ length: nextN }, (_, i) =>
    i < prevB.length ? prevB[i] : '0'
  );
  const newX0: string[] = Array.from({ length: nextN }, (_, i) =>
    i < prevX0.length ? prevX0[i] : '0'
  );
  return { A: newA, b: newB, x0: newX0 };
}

export function CalculatorSection({ externalPreset }: CalculatorSectionProps) {
  const [n, setN] = useState<number>(LECTURE_EXERCISE_1.n);
  const [decimals, setDecimals] = useState<number>(4);
  const [stopMode, setStopMode] = useState<StopMode>('iterations');
  const [fixedIterations, setFixedIterations] = useState<string>('4');
  const [toleranceInput, setToleranceInput] = useState<string>('0.0001');
  const [toleranceSafetyCap, setToleranceSafetyCap] = useState<string>('100');

  const [matrixA, setMatrixA] = useState<string[][]>(() =>
    toStringMatrix(LECTURE_EXERCISE_1.A)
  );
  const [vectorB, setVectorB] = useState<string[]>(() =>
    toStringVector(LECTURE_EXERCISE_1.b)
  );
  const [vectorX0, setVectorX0] = useState<string[]>(() =>
    toStringVector(LECTURE_EXERCISE_1.x0)
  );

  const [reorderNotice, setReorderNotice] = useState<{
    tone: 'info' | 'warning' | 'error';
    text: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<RelaxationResult | null>(null);
  const [showDominanceDetails, setShowDominanceDetails] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Sync external preset loaded from Exercises tab
  useEffect(() => {
    if (!externalPreset) return;
    const p = externalPreset.preset;
    setN(p.A.length);
    setMatrixA(toStringMatrix(p.A));
    setVectorB(toStringVector(p.b));
    setVectorX0(toStringVector(p.x0));
    setStopMode('iterations');
    setFixedIterations(String(p.iterations));
    setValidationError(null);
    setReorderNotice({
      tone: 'info',
      text: 'Sistema cargado desde Ejercicios Resueltos. Puede presionar «Resolver sistema» o «Reordenar filas» según corresponda.',
    });
    setResult(null);
  }, [externalPreset]);

  // Live numeric parse of matrix A for diagonal dominance badge
  const parsedLiveA = useMemo(() => {
    const parsed: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        const num = parseLocaleNumber(matrixA[i]?.[j] ?? '');
        if (num === null) return null;
        row.push(num);
      }
      parsed.push(row);
    }
    return parsed;
  }, [matrixA, n]);

  const liveDominance = useMemo(() => {
    if (!parsedLiveA) return null;
    return checkDiagonalDominance(parsedLiveA);
  }, [parsedLiveA]);

  const handleDimensionChange = (nextN: number) => {
    const resized = resizeGrid(matrixA, vectorB, vectorX0, nextN);
    setN(nextN);
    setMatrixA(resized.A);
    setVectorB(resized.b);
    setVectorX0(resized.x0);
    setValidationError(null);
    setReorderNotice(null);
    setResult(null);
  };

  const handleMatrixChange = (i: number, j: number, value: string) => {
    setMatrixA((prev) => {
      const next = prev.map((row) => row.slice());
      next[i][j] = value;
      return next;
    });
    setValidationError(null);
    setReorderNotice(null);
  };

  const handleVectorBChange = (i: number, value: string) => {
    setVectorB((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
    setValidationError(null);
  };

  const handleVectorX0Change = (i: number, value: string) => {
    setVectorX0((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
    setValidationError(null);
  };

  const handleLoadLectureExercise = () => {
    setN(LECTURE_EXERCISE_1.n);
    setMatrixA(toStringMatrix(LECTURE_EXERCISE_1.A));
    setVectorB(toStringVector(LECTURE_EXERCISE_1.b));
    setVectorX0(toStringVector(LECTURE_EXERCISE_1.x0));
    setStopMode('iterations');
    setFixedIterations('4');
    setDecimals(4);
    setValidationError(null);
    setReorderNotice({
      tone: 'info',
      text: 'Se cargó el ejercicio clásico de cátedra (3×3) con vector inicial [0.8, −1.7, 2.5]ᵀ.',
    });
    setResult(null);
  };

  const handleClearFields = () => {
    const empty = createEmptyGrid(n);
    setMatrixA(empty.A);
    setVectorB(empty.b);
    setVectorX0(empty.x0);
    setValidationError(null);
    setReorderNotice(null);
    setResult(null);
  };

  const parseAllInputs = (): {
    A: number[][];
    b: number[];
    x0: number[];
  } | null => {
    const A: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        const val = parseLocaleNumber(matrixA[i][j]);
        if (val === null) {
          setValidationError(
            `Valor numérico inválido o vacío en la matriz A (fila ${i + 1}, columna ${j + 1}). Ingrese un número real usando punto o coma decimal.`
          );
          return null;
        }
        row.push(val);
      }
      A.push(row);
    }

    const b: number[] = [];
    for (let i = 0; i < n; i++) {
      const val = parseLocaleNumber(vectorB[i]);
      if (val === null) {
        setValidationError(
          `Valor numérico inválido o vacío en el término independiente b${i + 1}.`
        );
        return null;
      }
      b.push(val);
    }

    const x0: number[] = [];
    for (let i = 0; i < n; i++) {
      const val = parseLocaleNumber(vectorX0[i]);
      if (val === null) {
        setValidationError(
          `Valor numérico inválido o vacío en el vector inicial x${i + 1}⁽⁰⁾.`
        );
        return null;
      }
      x0.push(val);
    }

    return { A, b, x0 };
  };

  const handleReorderRows = () => {
    setValidationError(null);
    const parsed = parseAllInputs();
    if (!parsed) return;

    const reordered = reorderForDiagonalDominance(parsed.A, parsed.b);
    if (!reordered.success) {
      setReorderNotice({ tone: 'error', text: reordered.message });
      return;
    }

    if (reordered.changed) {
      setMatrixA(toStringMatrix(reordered.matrixA));
      setVectorB(toStringVector(reordered.vectorB));
      setResult(null);
    }

    setReorderNotice({
      tone: reordered.achievedWeakDominance ? 'info' : 'warning',
      text: reordered.message,
    });
  };

  const handleSolve = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    setReorderNotice(null);

    const parsed = parseAllInputs();
    if (!parsed) {
      setResult(null);
      return;
    }

    let maxIter = 4;
    let tol = 1e-4;

    if (stopMode === 'iterations') {
      const parsedIter = parseLocaleNumber(fixedIterations);
      if (parsedIter === null || !Number.isInteger(parsedIter) || parsedIter < 1 || parsedIter > 50) {
        setValidationError('La cantidad fija de iteraciones debe ser un entero entre 1 y 50.');
        setResult(null);
        return;
      }
      maxIter = parsedIter;
    } else {
      const parsedTol = parseLocaleNumber(toleranceInput);
      if (parsedTol === null || parsedTol <= 0 || parsedTol >= 1) {
        setValidationError(
          'La tolerancia ε debe ser un número positivo menor que 1 (por ejemplo, 0.0001 o 1e-4).'
        );
        setResult(null);
        return;
      }
      const parsedCap = parseLocaleNumber(toleranceSafetyCap);
      if (parsedCap === null || !Number.isInteger(parsedCap) || parsedCap < 1 || parsedCap > 500) {
        setValidationError('El límite de seguridad de iteraciones debe estar entre 1 y 500.');
        setResult(null);
        return;
      }
      tol = parsedTol;
      maxIter = parsedCap;
    }

    const solved = solveRelaxation({
      A: parsed.A,
      b: parsed.b,
      x0: parsed.x0,
      stopMode,
      maxIterations: maxIter,
      tolerance: tol,
    });

    if (!solved.ok) {
      setValidationError(solved.error ?? 'Error al resolver el sistema.');
      setResult(null);
      return;
    }

    setResult(solved);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const normalizedLatex = useMemo(() => {
    if (!result?.normalized) return '';
    return buildNormalizedSystemLatex(result.normalized, decimals);
  }, [result, decimals]);

  const finalSolutionLatex = useMemo(() => {
    if (!result) return '';
    const entries = result.finalSolution.map((v) => formatFixed(v, decimals)).join(' \\\\ ');
    return `\\vec{x}^{(${result.iterationsPerformed})} = \\begin{pmatrix} ${entries} \\end{pmatrix}`;
  }, [result, decimals]);

  const stopReasonLabel = (reason: RelaxationResult['stopReason']) => {
    switch (reason) {
      case 'fixed_iterations':
        return 'Cantidad fija de iteraciones completada';
      case 'tolerance_reached':
        return 'Tolerancia residual alcanzada';
      case 'exact_zero':
        return 'Residuo nulo exacto alcanzado';
      case 'max_cap_reached':
        return 'Tope máximo de iteraciones alcanzado sin cumplir tolerancia';
      case 'diverged':
        return 'Proceso detenido por divergencia numérica';
    }
  };

  return (
    <article className="space-y-16" aria-labelledby="calc-heading">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A8A]">
          Herramienta de Cálculo Numérico · Doble Precisión IEEE-754
        </p>
        <h2
          id="calc-heading"
          className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl"
        >
          Calculadora Interactiva del Método de Relajación
        </h2>
        <p className="mt-4 w-full text-[1.125rem] leading-[1.75] text-slate-600">
          Configure la dimensión del sistema (<MathTex math="2 \le n \le 8" />), ingrese los
          coeficientes de <MathTex math="A" />, el vector <MathTex math="\vec{b}" /> y el vector
          inicial <MathTex math="\vec{x}^{(0)}" /> (se admiten punto y coma decimal), y obtenga el
          sistema normalizado, la tabla completa de iteraciones y la verificación de la solución.
        </p>
      </header>

      <form onSubmit={handleSolve} className="space-y-10" noValidate>
        {/* Configuration Panel */}
        <section
          aria-labelledby="config-heading"
          className="rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white shadow-sm p-7 sm:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h3 id="config-heading" className="font-serif text-xl font-bold text-[#0F172A]">
              Configuración del Sistema
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleLoadLectureExercise}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cargar ejercicio de cátedra</span>
              </button>
              <button
                type="button"
                onClick={handleReorderRows}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
              >
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reordenar filas (Dominancia Diagonal)</span>
              </button>
              <button
                type="button"
                onClick={handleClearFields}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-[#991B1B] hover:text-[#991B1B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Limpiar campos</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Dimension */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="dim-select"
                className="block text-xs font-semibold text-slate-600"
              >
                Dimensión (<MathTex math="n \times n" />)
              </label>
              <select
                id="dim-select"
                value={n}
                onChange={(e) => handleDimensionChange(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((dim) => (
                  <option key={dim} value={dim}>
                    {dim} × {dim} ({dim} incógnitas)
                  </option>
                ))}
              </select>
            </div>

            {/* Rounding decimals */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="decimals-select"
                className="block text-xs font-semibold text-slate-600"
              >
                Decimales de presentación
              </label>
              <select
                id="decimals-select"
                value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
              >
                {[2, 4, 6, 8].map((d) => (
                  <option key={d} value={d}>
                    {d} decimales
                  </option>
                ))}
              </select>
            </div>

            {/* Stop mode */}
            <div className="md:col-span-6 space-y-1.5">
              <span className="block text-xs font-semibold text-slate-600">
                Criterio de paro
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setStopMode('iterations')}
                    aria-pressed={stopMode === 'iterations'}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      stopMode === 'iterations'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-slate-700 hover:text-[#0F172A]'
                    }`}
                  >
                    Iteraciones fijas
                  </button>
                  <button
                    type="button"
                    onClick={() => setStopMode('tolerance')}
                    aria-pressed={stopMode === 'tolerance'}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      stopMode === 'tolerance'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-slate-700 hover:text-[#0F172A]'
                    }`}
                  >
                    Tolerancia ε
                  </button>
                </div>

                {stopMode === 'iterations' ? (
                  <div className="flex items-center gap-2">
                    <label htmlFor="fixed-iter-input" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                      <MathTex math="K =" />
                    </label>
                    <input
                      id="fixed-iter-input"
                      type="number"
                      min={1}
                      max={50}
                      value={fixedIterations}
                      onChange={(e) => setFixedIterations(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-[#0F172A] tabular-nums focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label htmlFor="tol-input" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                      <MathTex math="\varepsilon =" />
                    </label>
                    <input
                      id="tol-input"
                      type="text"
                      inputMode="decimal"
                      value={toleranceInput}
                      onChange={(e) => setToleranceInput(e.target.value)}
                      placeholder="1e-4"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-[#0F172A] tabular-nums focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                    />
                  </div>
                )}
              </div>

              {stopMode === 'tolerance' && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Valores frecuentes:</span>
                    {['1e-2', '1e-3', '1e-4', '1e-6'].map((presetTol) => (
                      <button
                        key={presetTol}
                        type="button"
                        onClick={() => setToleranceInput(presetTol)}
                        className="font-mono text-[#1E3A8A] underline-offset-2 hover:underline"
                      >
                        {presetTol}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="cap-input" className="whitespace-nowrap">
                      Tope máx.:
                    </label>
                    <input
                      id="cap-input"
                      type="number"
                      min={1}
                      max={500}
                      value={toleranceSafetyCap}
                      onChange={(e) => setToleranceSafetyCap(e.target.value)}
                      className="w-16 rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs text-[#0F172A] tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Diagonal Dominance Status Indicator (Clean Unboxed Editorial Row, Dual-Coded) */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm" role="status" aria-live="polite">
                {!liveDominance ? (
                  <>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="text-slate-600">
                      Complete todos los coeficientes de <MathTex math="A" /> para verificar la
                      dominancia diagonal.
                    </span>
                  </>
                ) : liveDominance.hasZeroDiagonal ? (
                  <>
                    <XCircle className="h-4 w-4 shrink-0 text-[#991B1B]" aria-hidden="true" />
                    <span className="font-medium text-[#991B1B]">
                      Diagonal con elemento nulo:{' '}
                      {liveDominance.zeroDiagonalRows.map((r) => `a${r + 1},${r + 1} = 0`).join(', ')}.
                    </span>
                    <span className="text-slate-600">
                      Use «Reordenar filas» o modifique los coeficientes antes de resolver.
                    </span>
                  </>
                ) : liveDominance.isStrictlyDominant ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span className="font-medium text-emerald-800">
                      Matriz Estrictamente Diagonalmente Dominante
                    </span>
                    <span className="text-slate-500">· Convergencia garantizada</span>
                  </>
                ) : liveDominance.isDominant ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
                    <span className="font-medium text-[#1E3A8A]">
                      Matriz Diagonalmente Dominante
                    </span>
                    <span className="text-slate-500">· Condición suficiente satisfecha</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <span className="font-medium text-amber-900">
                      Matriz No Diagonalmente Dominante
                    </span>
                    <span className="text-slate-600">
                      · La convergencia no está garantizada; pruebe reordenar filas.
                    </span>
                  </>
                )}
              </div>

              {liveDominance && (
                <button
                  type="button"
                  onClick={() => setShowDominanceDetails((v) => !v)}
                  aria-expanded={showDominanceDetails}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0"
                >
                  {showDominanceDetails ? (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>Ver análisis por fila</span>
                </button>
              )}
            </div>

            {showDominanceDetails && liveDominance && (
              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200/80 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                {liveDominance.rowDetails.map((d) => (
                  <div
                    key={d.rowIndex}
                    className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-xs font-mono tabular-nums"
                  >
                    <span className="text-slate-600">
                      Fila {d.rowIndex + 1}: |{formatFixed(d.diagonalAbs, 2)}|{' '}
                      {d.isStrictlyDominant ? '>' : d.isWeaklyDominant ? '≥' : '<'}{' '}
                      {formatFixed(d.offDiagonalSum, 2)}
                    </span>
                    <span
                      className={
                        d.isZeroDiagonal
                          ? 'font-sans font-semibold text-[#991B1B]'
                          : d.isWeaklyDominant
                            ? 'font-sans font-semibold text-emerald-700'
                            : 'font-sans font-semibold text-amber-800'
                      }
                    >
                      {d.isZeroDiagonal ? 'Nula' : d.isWeaklyDominant ? 'Cumple' : 'No cumple'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Feedback banners for Reorder or Validation errors */}
        {reorderNotice && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              reorderNotice.tone === 'error'
                ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                : reorderNotice.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                  : 'border-slate-200 bg-[#F8FAFC] text-[#1E3A8A]'
            }`}
          >
            {reorderNotice.text}
          </div>
        )}

        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3.5 text-sm text-[#991B1B]"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Error de validación del sistema</p>
              <p className="mt-0.5 text-[#7F1D1D]">{validationError}</p>
            </div>
          </div>
        )}

        {/* Matrix A, Vector b, Vector x^(0) Input Grid */}
        <section aria-labelledby="input-grid-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="input-grid-heading" className="font-serif text-lg font-semibold text-[#0F172A]">
              Entrada de Datos: <MathTex math="A \cdot \vec{x} = \vec{b}" /> y Vector Arrancador{' '}
              <MathTex math="\vec{x}^{(0)}" />
            </h3>
            <span className="text-xs text-slate-500">
              Diagonal principal sombreada · Acepta punto (.) o coma (,) decimal
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="inline-flex min-w-full items-start gap-6">
              {/* Matrix A */}
              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-slate-600">
                  Matriz de coeficientes <MathTex math="A" />
                </p>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${n}, minmax(4.5rem, 1fr))` }}
                >
                  {Array.from({ length: n }, (_, j) => (
                    <div
                      key={`col-h-${j}`}
                      className="text-center text-xs font-medium text-slate-500"
                    >
                      <MathTex math={`x_{${j + 1}}`} />
                    </div>
                  ))}
                  {Array.from({ length: n }, (_, i) =>
                    Array.from({ length: n }, (_, j) => {
                      const isDiag = i === j;
                      const parsedVal = parseLocaleNumber(matrixA[i]?.[j] ?? '');
                      const isZeroDiag = isDiag && parsedVal === 0;
                      const isInvalid = (matrixA[i]?.[j] ?? '').trim() !== '' && parsedVal === null;
                      return (
                        <input
                          key={`a-${i}-${j}`}
                          type="text"
                          inputMode="decimal"
                          value={matrixA[i]?.[j] ?? ''}
                          onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                          aria-label={`Coeficiente a fila ${i + 1} columna ${j + 1}`}
                          placeholder="0"
                          className={`w-full min-w-[4.5rem] rounded border px-2.5 py-2 text-right font-mono text-sm tabular-nums transition-colors focus:outline-none focus:ring-2 ${
                            isZeroDiag || isInvalid
                              ? 'border-[#991B1B] bg-[#FEF2F2] text-[#991B1B] focus:border-[#991B1B] focus:ring-[#991B1B]/20'
                              : isDiag
                                ? 'border-[#1E3A8A]/40 bg-[#F8FAFC] font-semibold text-[#1E3A8A] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                                : 'border-slate-300 bg-white text-[#0F172A] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                          }`}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Equals separator */}
              <div className="space-y-2" aria-hidden="true">
                <p className="text-center text-xs font-semibold text-transparent select-none">=</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-center text-xs text-transparent select-none">=</div>
                  {Array.from({ length: n }, (_, i) => (
                    <div
                      key={`eq-${i}`}
                      className="flex h-[38px] items-center justify-center font-serif text-base text-slate-400"
                    >
                      =
                    </div>
                  ))}
                </div>
              </div>

              {/* Vector b */}
              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-slate-600">
                  Vector <MathTex math="\vec{b}" />
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-center text-xs font-medium text-slate-500">
                    <MathTex math="b_i" />
                  </div>
                  {Array.from({ length: n }, (_, i) => {
                    const parsedVal = parseLocaleNumber(vectorB[i] ?? '');
                    const isInvalid = (vectorB[i] ?? '').trim() !== '' && parsedVal === null;
                    return (
                      <input
                        key={`b-${i}`}
                        type="text"
                        inputMode="decimal"
                        value={vectorB[i] ?? ''}
                        onChange={(e) => handleVectorBChange(i, e.target.value)}
                        aria-label={`Término independiente b${i + 1}`}
                        placeholder="0"
                        className={`w-24 rounded border px-2.5 py-2 text-right font-mono text-sm tabular-nums transition-colors focus:outline-none focus:ring-2 ${
                          isInvalid
                            ? 'border-[#991B1B] bg-[#FEF2F2] text-[#991B1B] focus:ring-[#991B1B]/20'
                            : 'border-slate-300 bg-white text-[#0F172A] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Vertical divider */}
              <div className="self-stretch border-l border-slate-200" aria-hidden="true" />

              {/* Vector x^(0) */}
              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-slate-600">
                  Vector inicial <MathTex math="\vec{x}^{(0)}" />
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-center text-xs font-medium text-slate-500">
                    <MathTex math="x_i^{(0)}" />
                  </div>
                  {Array.from({ length: n }, (_, i) => {
                    const parsedVal = parseLocaleNumber(vectorX0[i] ?? '');
                    const isInvalid = (vectorX0[i] ?? '').trim() !== '' && parsedVal === null;
                    return (
                      <input
                        key={`x0-${i}`}
                        type="text"
                        inputMode="decimal"
                        value={vectorX0[i] ?? ''}
                        onChange={(e) => handleVectorX0Change(i, e.target.value)}
                        aria-label={`Valor inicial x${i + 1} sub cero`}
                        placeholder="0"
                        className={`w-24 rounded border px-2.5 py-2 text-right font-mono text-sm tabular-nums transition-colors focus:outline-none focus:ring-2 ${
                          isInvalid
                            ? 'border-[#991B1B] bg-[#FEF2F2] text-[#991B1B] focus:ring-[#991B1B]/20'
                            : 'border-slate-300 bg-[#F8FAFC] text-[#0F172A] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#172554] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] whitespace-nowrap shrink-0"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              <span>Resolver sistema</span>
            </button>
          </div>
        </section>
      </form>

      {/* Detailed Results Section */}
      {result && result.ok && (
        <div
          ref={resultsRef}
          className="scroll-mt-6 space-y-14 border-t border-slate-200 pt-10"
          data-testid="calculator-results"
        >
          {/* 1. Dynamic Normalized Equivalent System */}
          <section aria-labelledby="res-norm-heading" className="space-y-4">
            <h3 id="res-norm-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
              1. Sistema Equivalente Normalizado
            </h3>
            <p className="text-[1.0625rem] leading-[1.75] text-slate-600">
              Obtenido al dividir cada ecuación <MathTex math="i" /> por{' '}
              <MathTex math="-a_{ii}" /> para fijar la diagonal principal en <MathTex math="-1" />:
            </p>
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white px-7 py-6 shadow-sm">
              <MathTex block math={normalizedLatex} />
            </div>
          </section>

          {/* 2. Full Iteration Table */}
          <section aria-labelledby="res-table-heading" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="res-table-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
                2. Tabla Completa de Iteraciones
              </h3>
              <span className="text-xs text-slate-500">
                Resaltado en <strong className="text-[#991B1B]">bordó (máx)</strong>: mayor{' '}
                <MathTex math="|R_i|" /> de cada iteración
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-700">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-[#F8FAFC] px-3.5 py-3 text-left whitespace-nowrap border-r border-slate-200"
                    >
                      <MathTex math="k" />
                    </th>
                    {Array.from({ length: n }, (_, i) => (
                      <Fragment key={`th-pair-${i}`}>
                        <th scope="col" className="px-3 py-3 text-right whitespace-nowrap">
                          <MathTex math={`x_{${i + 1}}`} />
                        </th>
                        <th scope="col" className="px-3 py-3 text-right whitespace-nowrap border-r border-slate-100">
                          <MathTex math={`R_{${i + 1}}`} />
                        </th>
                      </Fragment>
                    ))}
                    <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
                      Variable corregida (<MathTex math="\delta x_m = R_m" />)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.iterations.map((row, rowIdx) => {
                    const isFinal = row.updatedVarIndex === null;
                    const prevUpdatedIdx =
                      rowIdx > 0 ? result.iterations[rowIdx - 1].updatedVarIndex : null;
                    return (
                      <tr
                        key={row.k}
                        className={isFinal ? 'bg-[#F8FAFC] font-medium' : 'hover:bg-slate-50/70'}
                      >
                        <th
                          scope="row"
                          className={`sticky left-0 z-10 border-r border-slate-200 px-3.5 py-2.5 text-left font-mono text-xs whitespace-nowrap ${
                            isFinal
                              ? 'bg-[#F8FAFC] font-semibold text-[#1E3A8A]'
                              : 'bg-white font-medium text-slate-700'
                          }`}
                        >
                          {isFinal ? `${row.k} (Final)` : row.k}
                        </th>
                        {Array.from({ length: n }, (_, i) => {
                          const isMax = row.maxResidualIndex === i && !isFinal;
                          const isFinalMax = row.maxResidualIndex === i && isFinal && row.maxResidualAbs > 0;
                          const isZeroed = prevUpdatedIdx === i && Math.abs(row.residuals[i]) < 1e-12;
                          return (
                            <Fragment key={`cell-pair-${i}`}>
                              <td className="px-3 py-2.5 text-right font-mono text-[13px] text-[#0F172A] tabular-nums whitespace-nowrap">
                                {formatFixed(row.x[i], decimals)}
                              </td>
                              <td
                                className={`border-r border-slate-100 px-3 py-2.5 text-right font-mono text-[13px] tabular-nums whitespace-nowrap ${
                                  isMax || isFinalMax
                                    ? 'bg-[#FEF2F2] font-bold text-[#991B1B]'
                                    : isZeroed
                                      ? 'bg-slate-100/80 font-semibold text-[#1E3A8A]'
                                      : 'text-slate-600'
                                }`}
                              >
                                <span>{formatFixed(row.residuals[i], decimals)}</span>
                                {(isMax || isFinalMax) && (
                                  <span className="ml-1 text-[10px] font-sans font-semibold uppercase tracking-wide text-[#991B1B]">
                                    máx
                                  </span>
                                )}
                              </td>
                            </Fragment>
                          );
                        })}
                        <td className="px-4 py-2.5 text-left font-mono text-xs text-slate-700 whitespace-nowrap">
                          {isFinal ? (
                            <span className="font-sans text-slate-500">
                              {stopReasonLabel(result.stopReason)}
                            </span>
                          ) : (
                            <MathTex
                              math={`x_{${row.updatedVarIndex! + 1}}^{(${row.k + 1})} = ${formatFixed(
                                row.x[row.updatedVarIndex!],
                                decimals
                              )} ${row.deltaApplied! >= 0 ? '+' : '-'} ${formatFixed(
                                Math.abs(row.deltaApplied!),
                                decimals
                              )} = ${formatFixed(row.updatedNewValue!, decimals)}`}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Final Solution Summary & Verification */}
          <section aria-labelledby="res-summary-heading" className="space-y-6">
            <h3 id="res-summary-heading" className="font-serif text-xl font-semibold text-[#1E3A8A]">
              3. Resumen de Solución Final y Verificación
            </h3>

            {result.stopReason === 'diverged' && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Los residuos superaron el umbral de divergencia. Verifique si el sistema admite
                  reordenamiento para lograr dominancia diagonal.
                </span>
              </div>
            )}

            {/* Key Summary Strip */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white shadow-sm p-6 sm:p-7 md:col-span-5 flex items-center justify-center">
                <MathTex block math={finalSolutionLatex} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-7">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Iteraciones realizadas</p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
                    {result.iterationsPerformed}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stopReasonLabel(result.stopReason)}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Residuo máximo final <MathTex math="\max |R_i|" />
                  </p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold text-[#991B1B] tabular-nums">
                    {formatFixed(result.finalMaxResidual, decimals)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    En ecuación normalizada
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Máx. error <MathTex math="\|A\vec{x}^{(k)} - \vec{b}\|_\infty" />
                  </p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold text-[#1E3A8A] tabular-nums">
                    {formatFixed(
                      Math.max(...result.verification.map((v) => v.absDiff)),
                      decimals
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Sobre sistema original</p>
                </div>
              </div>
            </div>

            {/* Comparative Verification Table: x^(0) vs x^(k) and A*x^(k) vs b */}
            <div className="space-y-3">
              <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                Tabla Comparativa: Valores Iniciales, Solución Final y Verificación{' '}
                <MathTex math="A \cdot \vec{x}^{(k)} \text{ vs. } \vec{b}" />
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-700">
                      <th scope="col" className="px-4 py-3 text-left whitespace-nowrap">
                        Incógnita
                      </th>
                      <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                        Valor inicial <MathTex math="x_i^{(0)}" />
                      </th>
                      <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                        Valor final <MathTex math={`x_i^{(${result.iterationsPerformed})}`} />
                      </th>
                      <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                        <MathTex math={`(A\\cdot\\vec{x}^{(${result.iterationsPerformed})})_i`} />
                      </th>
                      <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                        Objetivo <MathTex math="b_i" />
                      </th>
                      <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                        Diferencia <MathTex math="|(A\vec{x})_i - b_i|" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {result.verification.map((v) => (
                      <tr key={v.index} className="hover:bg-slate-50/70">
                        <th
                          scope="row"
                          className="px-4 py-3 text-left font-medium text-[#0F172A] whitespace-nowrap"
                        >
                          <MathTex math={`x_{${v.index + 1}}`} />
                        </th>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-slate-600 tabular-nums whitespace-nowrap">
                          {formatFixed(v.xInitial, decimals)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold text-[#1E3A8A] tabular-nums whitespace-nowrap">
                          {formatFixed(v.xFinal, decimals)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-[#0F172A] tabular-nums whitespace-nowrap">
                          {formatFixed(v.axFinal, decimals)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-slate-600 tabular-nums whitespace-nowrap">
                          {formatFixed(v.bTarget, decimals)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-slate-700 tabular-nums whitespace-nowrap">
                          {formatFixed(v.absDiff, decimals)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
