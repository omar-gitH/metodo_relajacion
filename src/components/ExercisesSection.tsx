import { Fragment, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { MathTex } from './MathTex';

export interface ExercisePreset {
  A: number[][];
  b: number[];
  x0: number[];
  iterations: number;
}

interface ExercisesSectionProps {
  onLoadInCalculator: (preset: ExercisePreset) => void;
}

interface StepBlock {
  id: string;
  label: string;
  title: string;
  content: ReactNode;
}

interface SummaryTableRow {
  k: string;
  isSolution?: boolean;
  values: [string, string, string]; // x1, x2, x3
  residuals: [string, string, string]; // R1, R2, R3
  maxIndex: number | null; // 0, 1, or 2
  zeroedIndex: number | null; // index zeroed from previous step
  updateFormula: string;
}

const EXERCISE_1_TABLE: SummaryTableRow[] = [
  {
    k: '0',
    values: ['0.80000', '-1.70000', '2.50000'],
    residuals: ['0.16000', '-0.13740', '0.48000'],
    maxIndex: 2,
    zeroedIndex: null,
    updateFormula: 'x_3^{(1)} = 2.5 + 0.48 = 2.98',
  },
  {
    k: '1',
    values: ['0.80000', '-1.70000', '2.98000'],
    residuals: ['0.11200', '-0.26508', '0'],
    maxIndex: 1,
    zeroedIndex: 2,
    updateFormula: 'x_2^{(2)} = -1.7 + (-0.26508) = -1.96508',
  },
  {
    k: '2',
    values: ['0.80000', '-1.96508', '2.98000'],
    residuals: ['0.19150', '0', '0.02650'],
    maxIndex: 0,
    zeroedIndex: 1,
    updateFormula: 'x_1^{(3)} = 0.8 + 0.1915 = 0.9915',
  },
  {
    k: '3',
    values: ['0.99150', '-1.96508', '2.98000'],
    residuals: ['0', '-0.02546', '0.01693'],
    maxIndex: 1,
    zeroedIndex: 0,
    updateFormula: 'x_2^{(4)} = -1.96508 + (-0.02546) = -1.99054',
  },
  {
    k: '4 (Sol.)',
    isSolution: true,
    values: ['0.99150', '-1.99054', '2.98000'],
    residuals: ['—', '0', '—'],
    maxIndex: null,
    zeroedIndex: 1,
    updateFormula: '\\text{Fin de las 4 iteraciones solicitadas}',
  },
];

const EXERCISE_2_TABLE: SummaryTableRow[] = [
  {
    k: '0',
    values: ['0.0000', '0.0000', '0.0000'],
    residuals: ['1.7000', '-0.6000', '1.2000'],
    maxIndex: 0,
    zeroedIndex: null,
    updateFormula: 'x_1^{(1)} = 0 + 1.7 = 1.7',
  },
  {
    k: '1',
    values: ['1.7000', '0.0000', '0.0000'],
    residuals: ['0', '-0.7700', '1.2000'],
    maxIndex: 2,
    zeroedIndex: 0,
    updateFormula: 'x_3^{(2)} = 0 + 1.2 = 1.2',
  },
  {
    k: '2',
    values: ['1.7000', '0.0000', '1.2000'],
    residuals: ['0.1200', '-1.0100', '0'],
    maxIndex: 1,
    zeroedIndex: 2,
    updateFormula: 'x_2^{(3)} = 0 + (-1.01) = -1.01',
  },
  {
    k: '3 (Sol.)',
    isSolution: true,
    values: ['1.7000', '-1.0100', '1.2000'],
    residuals: ['0.3220', '0', '-0.2020'],
    maxIndex: null,
    zeroedIndex: 1,
    updateFormula: '\\text{Fin de las 3 iteraciones solicitadas}',
  },
];

export function ExercisesSection({ onLoadInCalculator }: ExercisesSectionProps) {
  const [selectedExercise, setSelectedExercise] = useState<'ex1' | 'ex2'>('ex1');
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({
    'ex1-p0': true,
    'ex1-k0': true,
    'ex1-k1': false,
    'ex1-k2': false,
    'ex1-k3': false,
    'ex2-p0': true,
    'ex2-p1': true,
    'ex2-k0': true,
    'ex2-k1': false,
    'ex2-k2': false,
  });

  const exercise1Steps: StepBlock[] = [
    {
      id: 'ex1-p0',
      label: 'Paso 0',
      title: 'Verificación de dominancia diagonal y normalización del sistema',
      content: (
        <div className="space-y-4 text-base leading-[1.75] text-slate-700">
          <p>
            Primero comprobamos que la matriz de coeficientes es estrictamente diagonalmente
            dominante en sus tres filas:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{aligned} \text{Fila 1: } & |10| > |3| + |1| = 4 \\ \text{Fila 2: } & |15| > |2| + |4| = 6 \\ \text{Fila 3: } & |20| > |1| + |2| = 3 \end{aligned}"
            />
          </div>
          <p>
            Para llevar toda la diagonal principal a <MathTex math="-1" />, dividimos cada ecuación{' '}
            <MathTex math="i" /> por <MathTex math="-a_{ii}" /> (es decir, por{' '}
            <MathTex math="-10" />, <MathTex math="-15" /> y <MathTex math="-20" /> respectivamente)
            e igualamos a cero:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} -x_1 - \dfrac{3}{10}x_2 - \dfrac{1}{10}x_3 + \dfrac{7}{10} = 0 \\[8pt] -\dfrac{2}{15}x_1 - x_2 - \dfrac{4}{15}x_3 - \dfrac{16}{15} = 0 \\[8pt] -\dfrac{1}{20}x_1 - \dfrac{2}{20}x_2 - x_3 + \dfrac{57}{20} = 0 \end{cases}"
            />
          </div>
          <p>
            Expresando los coeficientes en forma decimal (con truncamiento a 3 decimales en la
            segunda ecuación, según el desarrollo clásico de cátedra) y nombrando cada ecuación como
            residuo <MathTex math="R_i" /> asociado a <MathTex math="x_i" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1 = -x_1 - 0.3\,x_2 - 0.1\,x_3 + 0.7 = 0 & (R_1 \to x_1) \\[4pt] R_2 = -0.133\,x_1 - x_2 - 0.266\,x_3 - 1.066 = 0 & (R_2 \to x_2) \\[4pt] R_3 = -0.05\,x_1 - 0.1\,x_2 - x_3 + 2.85 = 0 & (R_3 \to x_3) \end{cases}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex1-k0',
      label: 'Iteración k = 0',
      title: 'Evaluación inicial y primera relajación sobre x₃',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Evaluamos los residuos con el vector arrancador{' '}
            <MathTex math="\vec{x}^{(0)} = (0.8,\; -1.7,\; 2.5)^T" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(0)} = -(0.8) - 0.3(-1.7) - 0.1(2.5) + 0.7 = 0.16 \\[4pt] R_2^{(0)} = -0.133(0.8) - (-1.7) - 0.266(2.5) - 1.066 = -0.1374 \\[4pt] R_3^{(0)} = -0.05(0.8) - 0.1(-1.7) - (2.5) + 2.85 = \mathbf{0.48} \end{cases}"
            />
          </div>
          <p>
            El mayor residuo en valor absoluto es{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_3^{(0)}| = 0.48" />
            </span>
            . Actualizamos únicamente <MathTex math="x_3" /> sumándole{' '}
            <MathTex math="R_3^{(0)} = 0.48" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_3^{(1)} = x_3^{(0)} + R_3^{(0)} = 2.5 + 0.48 = 2.98 \implies \vec{x}^{(1)} = \begin{pmatrix} 0.8 \\ -1.7 \\ 2.98 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex1-k1',
      label: 'Iteración k = 1',
      title: 'Anulación de R₃ y relajación sobre x₂',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Evaluamos los residuos en <MathTex math="\vec{x}^{(1)} = (0.8,\; -1.7,\; 2.98)^T" />{' '}
            (nótese que <MathTex math="R_3^{(1)} = 0" />):
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(1)} = -(0.8) - 0.3(-1.7) - 0.1(2.98) + 0.7 = 0.112 \\[4pt] R_2^{(1)} = -0.133(0.8) - (-1.7) - 0.266(2.98) - 1.066 = \mathbf{-0.26508} \\[4pt] R_3^{(1)} = -0.05(0.8) - 0.1(-1.7) - (2.98) + 2.85 = 0 \end{cases}"
            />
          </div>
          <p>
            El mayor residuo en valor absoluto es{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_2^{(1)}| = 0.26508" />
            </span>
            . Modificamos únicamente <MathTex math="x_2" /> conservando su signo negativo:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_2^{(2)} = -1.7 + (-0.26508) = -1.96508 \implies \vec{x}^{(2)} = \begin{pmatrix} 0.8 \\ -1.96508 \\ 2.98 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex1-k2',
      label: 'Iteración k = 2',
      title: 'Anulación de R₂ y relajación sobre x₁',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Evaluamos los residuos en{' '}
            <MathTex math="\vec{x}^{(2)} = (0.8,\; -1.96508,\; 2.98)^T" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(2)} = -(0.8) - 0.3(-1.96508) - 0.1(2.98) + 0.7 = \mathbf{0.1915} \\[4pt] R_2^{(2)} = -0.133(0.8) - (-1.96508) - 0.266(2.98) - 1.066 = 0 \\[4pt] R_3^{(2)} = -0.05(0.8) - 0.1(-1.96508) - (2.98) + 2.85 = 0.02650 \end{cases}"
            />
          </div>
          <p>
            El mayor residuo en valor absoluto es{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_1^{(2)}| = 0.1915" />
            </span>
            . Actualizamos únicamente <MathTex math="x_1" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_1^{(3)} = 0.8 + 0.1915 = 0.9915 \implies \vec{x}^{(3)} = \begin{pmatrix} 0.9915 \\ -1.96508 \\ 2.98 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex1-k3',
      label: 'Iteración k = 3',
      title: 'Anulación de R₁ y cuarta corrección sobre x₂',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Evaluamos los residuos en{' '}
            <MathTex math="\vec{x}^{(3)} = (0.9915,\; -1.96508,\; 2.98)^T" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(3)} = -(0.9915) - 0.3(-1.96508) - 0.1(2.98) + 0.7 = 0 \\[4pt] R_2^{(3)} = -0.133(0.9915) - (-1.96508) - 0.266(2.98) - 1.066 = \mathbf{-0.02546} \\[4pt] R_3^{(3)} = -0.05(0.9915) - 0.1(-1.96508) - (2.98) + 2.85 = 0.01693 \end{cases}"
            />
          </div>
          <p>
            El mayor residuo en valor absoluto es{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_2^{(3)}| = 0.02546" />
            </span>
            . Sumamos <MathTex math="R_2^{(3)}" /> a <MathTex math="x_2^{(3)}" /> para obtener la
            aproximación de la cuarta iteración:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_2^{(4)} = -1.96508 + (-0.02546) = -1.99054 \implies \vec{x}^{(4)} = \begin{pmatrix} 0.9915 \\ -1.99054 \\ 2.98 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
  ];

  const exercise2Steps: StepBlock[] = [
    {
      id: 'ex2-p0',
      label: 'Paso 0A',
      title: 'Diagnóstico de diagonal nula y permutación de ecuaciones',
      content: (
        <div className="space-y-4 text-base leading-[1.75] text-slate-700">
          <p>
            El sistema original presenta un elemento nulo en la diagonal principal (
            <MathTex math="a_{11} = 0" />) e incumple la dominancia diagonal en todas sus filas:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{aligned} \text{Ec. 1: } & |a_{11}| = 0 < |-2| + |10| = 12 \quad (\text{imposible dividir por } -a_{11}) \\ \text{Ec. 2: } & |a_{22}| = 2 < |10| + |-1| = 11 \\ \text{Ec. 3: } & |a_{33}| = 2 < |1| + |10| = 11 \end{aligned}"
            />
          </div>
          <p>
            Permutando las ecuaciones según <MathTex math="(\text{Ec. 2} \to F_1,\; \text{Ec. 3} \to F_2,\; \text{Ec. 1} \to F_3)" />{' '}
            obtenemos un sistema algebraicamente equivalente con{' '}
            <strong>dominancia diagonal estricta</strong>:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} 10x_1 + 2x_2 - x_3 = 17 & (|10| > |2| + |-1| = 3) \\[4pt] x_1 + 10x_2 + 2x_3 = -6 & (|10| > |1| + |2| = 3) \\[4pt] -2x_2 + 10x_3 = 12 & (|10| > |0| + |-2| = 2) \end{cases}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex2-p1',
      label: 'Paso 0B',
      title: 'Normalización del sistema reordenado (diagonal en −1)',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Dividiendo cada ecuación reordenada por <MathTex math="-a_{ii} = -10" /> e igualando a
            cero obtenemos las expresiones exactas de los residuos:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1 = -x_1 - 0.2\,x_2 + 0.1\,x_3 + 1.7 = 0 & (R_1 \to x_1) \\[4pt] R_2 = -0.1\,x_1 - x_2 - 0.2\,x_3 - 0.6 = 0 & (R_2 \to x_2) \\[4pt] R_3 = 0.2\,x_2 - x_3 + 1.2 = 0 & (R_3 \to x_3) \end{cases}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex2-k0',
      label: 'Iteración k = 0',
      title: 'Residuos iniciales en x⁽⁰⁾ = (0, 0, 0)ᵀ y corrección de x₁',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Al partir del vector nulo <MathTex math="\vec{x}^{(0)} = (0,\; 0,\; 0)^T" />, los
            residuos iniciales coinciden directamente con los términos independientes normalizados{' '}
            <MathTex math="c_i" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="R_1^{(0)} = \mathbf{1.7}, \qquad R_2^{(0)} = -0.6, \qquad R_3^{(0)} = 1.2"
            />
          </div>
          <p>
            El máximo absoluto corresponde a{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_1^{(0)}| = 1.7" />
            </span>
            . Actualizamos <MathTex math="x_1" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_1^{(1)} = 0 + 1.7 = 1.7 \implies \vec{x}^{(1)} = \begin{pmatrix} 1.7 \\ 0 \\ 0 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex2-k1',
      label: 'Iteración k = 1',
      title: 'Anulación de R₁ y corrección de x₃',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Actualizando los residuos con <MathTex math="\vec{x}^{(1)} = (1.7,\; 0,\; 0)^T" />{' '}
            (mediante <MathTex math="R_i^{(1)} = R_i^{(0)} + b_{i1} \cdot 1.7" />):
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(1)} = 0 \\[4pt] R_2^{(1)} = -0.6 + (-0.1)(1.7) = -0.77 \\[4pt] R_3^{(1)} = 1.2 + (0)(1.7) = \mathbf{1.2} \end{cases}"
            />
          </div>
          <p>
            Seleccionamos{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_3^{(1)}| = 1.2" />
            </span>{' '}
            y corregimos únicamente <MathTex math="x_3" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_3^{(2)} = 0 + 1.2 = 1.2 \implies \vec{x}^{(2)} = \begin{pmatrix} 1.7 \\ 0 \\ 1.2 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'ex2-k2',
      label: 'Iteración k = 2',
      title: 'Anulación de R₃ y corrección de x₂',
      content: (
        <div className="space-y-3 text-base leading-[1.75] text-slate-700">
          <p>
            Evaluando los residuos con <MathTex math="\vec{x}^{(2)} = (1.7,\; 0,\; 1.2)^T" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="\begin{cases} R_1^{(2)} = 0 + (0.1)(1.2) = 0.12 \\[4pt] R_2^{(2)} = -0.77 + (-0.2)(1.2) = \mathbf{-1.01} \\[4pt] R_3^{(2)} = 0 \end{cases}"
            />
          </div>
          <p>
            El mayor residuo en valor absoluto es{' '}
            <span className="font-semibold text-[#991B1B]">
              <MathTex math="|R_2^{(2)}| = 1.01" />
            </span>
            . Actualizamos <MathTex math="x_2" /> para obtener <MathTex math="\vec{x}^{(3)}" />:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <MathTex
              block
              math="x_2^{(3)} = 0 + (-1.01) = -1.01 \implies \vec{x}^{(3)} = \begin{pmatrix} 1.7 \\ -1.01 \\ 1.2 \end{pmatrix}"
            />
          </div>
        </div>
      ),
    },
  ];

  const activeSteps = selectedExercise === 'ex1' ? exercise1Steps : exercise2Steps;
  const activeTable = selectedExercise === 'ex1' ? EXERCISE_1_TABLE : EXERCISE_2_TABLE;

  const allExpanded = activeSteps.every((s) => openSteps[s.id]);

  const toggleStep = (id: string) => {
    setOpenSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllSteps = () => {
    const nextState = !allExpanded;
    setOpenSteps((prev) => {
      const updated = { ...prev };
      for (const s of activeSteps) {
        updated[s.id] = nextState;
      }
      return updated;
    });
  };

  const handleLoadPreset = () => {
    if (selectedExercise === 'ex1') {
      onLoadInCalculator({
        A: [
          [10, 3, 1],
          [2, 15, 4],
          [1, 2, 20],
        ],
        b: [7, -16, 57],
        x0: [0.8, -1.7, 2.5],
        iterations: 4,
      });
    } else {
      onLoadInCalculator({
        A: [
          [0, -2, 10],
          [10, 2, -1],
          [1, 10, 2],
        ],
        b: [12, 17, -6],
        x0: [0, 0, 0],
        iterations: 3,
      });
    }
  };

  return (
    <article className="space-y-16" aria-labelledby="exercises-heading">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A8A]">
          Práctica Guiada · Resolución Paso a Paso
        </p>
        <h2
          id="exercises-heading"
          className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl"
        >
          Ejercicios Resueltos
        </h2>
        <p className="mt-4 w-full text-[1.125rem] leading-[1.75] text-slate-600">
          Dos casos completos desarrollados con la tabla clásica de relajación: un sistema
          directamente diagonalmente dominante de cátedra y un sistema con diagonal nula que exige
          permutación previa de filas.
        </p>

        {/* Exercise Selector */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Selector de ejercicio resuelto"
            className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1.5"
          >
            <button
              type="button"
              onClick={() => setSelectedExercise('ex1')}
              aria-pressed={selectedExercise === 'ex1'}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${
                selectedExercise === 'ex1'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0F172A]'
              }`}
            >
              Ejercicio 1: Sistema de cátedra
            </button>
            <button
              type="button"
              onClick={() => setSelectedExercise('ex2')}
              aria-pressed={selectedExercise === 'ex2'}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${
                selectedExercise === 'ex2'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0F172A]'
              }`}
            >
              Ejercicio 2: Reordenamiento previo
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadPreset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E3A8A] bg-white px-4 py-2.5 text-sm font-medium text-[#1E3A8A] shadow-2xs transition-colors hover:bg-[#1E3A8A] hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            <span>Abrir en Calculadora</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Problem Statement Box */}
      <section className="rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white shadow-sm p-7 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3.5">
          <h3 className="font-serif text-xl font-bold text-[#0F172A]">
            {selectedExercise === 'ex1'
              ? 'Enunciado — Ejercicio 1 (4 iteraciones)'
              : 'Enunciado — Ejercicio 2 (Permutación de filas y 3 iteraciones)'}
          </h3>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
            {selectedExercise === 'ex1'
              ? 'Sistema 3×3 diagonalmente dominante'
              : 'Sistema 3×3 con diagonal inicial nula'}
          </span>
        </div>

        <p className="mt-5 text-[1.0625rem] leading-[1.75] text-slate-700">
          {selectedExercise === 'ex1' ? (
            <>
              Dado el siguiente sistema de ecuaciones lineales <MathTex math="A \cdot \vec{x} = \vec{b}" />{' '}
              y el vector inicial <MathTex math="\vec{x}^{(0)}" />, realizar{' '}
              <strong>4 iteraciones</strong> aplicando el Método de Relajación y comparar el
              resultado con la solución exacta:
            </>
          ) : (
            <>
              Dado el siguiente sistema <MathTex math="3 \times 3" /> cuya matriz original presenta{' '}
              <MathTex math="a_{11} = 0" /> y no es diagonalmente dominante, reordenar las
              ecuaciones para obtener dominancia diagonal estricta, normalizar el sistema y realizar{' '}
              <strong>3 iteraciones</strong> desde el vector nulo <MathTex math="\vec{x}^{(0)}" />:
            </>
          )}
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8FAFC] px-6 py-5">
          {selectedExercise === 'ex1' ? (
            <MathTex
              block
              math="\begin{cases} 10x_1 + 3x_2 + x_3 = 7 \\ 2x_1 + 15x_2 + 4x_3 = -16 \\ x_1 + 2x_2 + 20x_3 = 57 \end{cases}, \qquad \vec{x}^{(0)} = \begin{pmatrix} 0.8 \\ -1.7 \\ 2.5 \end{pmatrix}"
            />
          ) : (
            <MathTex
              block
              math="\begin{cases} 0x_1 - 2x_2 + 10x_3 = 12 \\ 10x_1 + 2x_2 - x_3 = 17 \\ x_1 + 10x_2 + 2x_3 = -6 \end{cases}, \qquad \vec{x}^{(0)} = \begin{pmatrix} 0 \\ 0 \\ 0 \end{pmatrix}"
            />
          )}
        </div>
      </section>

      {/* Expandable Step-by-Step Resolution */}
      <section aria-labelledby="steps-detail-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="steps-detail-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
            Desarrollo Paso a Paso
          </h3>
          <button
            type="button"
            onClick={toggleAllSteps}
            className="text-sm font-semibold text-[#1E3A8A] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            {allExpanded ? 'Contraer todos los pasos' : 'Expandir todos los pasos'}
          </button>
        </div>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {activeSteps.map((step) => {
            const isOpen = !!openSteps[step.id];
            return (
              <div key={step.id}>
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${step.id}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E3A8A]"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="inline-flex items-center rounded-md bg-[#1E3A8A]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[#1E3A8A]">
                      {step.label}
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#0F172A]">
                      {step.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <div
                    id={`panel-${step.id}`}
                    className="border-t border-slate-100 bg-[#F8FAFC]/70 px-6 py-6 sm:px-7"
                  >
                    {step.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Classic Relaxation Summary Table */}
      <section aria-labelledby="summary-table-heading" className="space-y-6">
        <div className="space-y-2">
          <h3 id="summary-table-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
            Tabla Resumen de Relajación
          </h3>
          <p className="text-[1.0625rem] leading-[1.75] text-slate-600">
            En cada fila se resalta en{' '}
            <span className="font-semibold text-[#991B1B]">bordó y negrita (máx)</span> el residuo
            de mayor valor absoluto <MathTex math="|R_m^{(k)}|" />. Observe cómo dicho residuo se
            anula (<MathTex math="0" />) en la iteración inmediatamente siguiente.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-[0.95rem]">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-700">
                <th scope="col" className="px-4 py-3.5 text-left whitespace-nowrap">
                  Iteración <MathTex math="k" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="x_1" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="R_1" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="x_2" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="R_2" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="x_3" />
                </th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">
                  <MathTex math="R_3" />
                </th>
                <th scope="col" className="px-5 py-3.5 text-left whitespace-nowrap">
                  Variable actualizada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeTable.map((row) => (
                <tr
                  key={row.k}
                  className={row.isSolution ? 'bg-[#F8FAFC] font-medium' : 'hover:bg-slate-50/70'}
                >
                  <th
                    scope="row"
                    className={`px-4 py-3.5 text-left font-mono text-xs whitespace-nowrap ${
                      row.isSolution ? 'font-semibold text-[#1E3A8A]' : 'font-medium text-slate-700'
                    }`}
                  >
                    {row.k}
                  </th>
                  {[0, 1, 2].map((idx) => {
                    const isMax = row.maxIndex === idx;
                    const isZeroed = row.zeroedIndex === idx;
                    return (
                      <Fragment key={`pair-${idx}`}>
                        <td className="px-4 py-3.5 text-right font-mono text-sm text-[#0F172A] tabular-nums whitespace-nowrap">
                          {row.values[idx]}
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-mono text-sm tabular-nums whitespace-nowrap ${
                            isMax
                              ? 'bg-[#FEF2F2] font-bold text-[#991B1B]'
                              : isZeroed
                                ? 'bg-slate-100/80 font-semibold text-[#1E3A8A]'
                                : 'text-slate-600'
                          }`}
                        >
                          <span>{row.residuals[idx]}</span>
                          {isMax && (
                            <span className="ml-1.5 text-[10px] font-sans font-semibold uppercase tracking-wide text-[#991B1B]">
                              máx
                            </span>
                          )}
                        </td>
                      </Fragment>
                    );
                  })}
                  <td className="px-5 py-3.5 text-left text-xs text-slate-700 whitespace-nowrap">
                    <MathTex math={row.updateFormula} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comparison with Exact Solution */}
      <section className="rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white shadow-sm p-7 sm:p-8 space-y-5">
        <h3 className="font-serif text-xl font-bold text-[#0F172A]">
          Comparación con la Solución Exacta
        </h3>

        {selectedExercise === 'ex1' ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-6 py-5">
              <MathTex
                block
                math="\vec{x}^{(4)} \approx \begin{pmatrix} 0.9915 \\ -1.99054 \\ 2.98 \end{pmatrix} \qquad \text{vs.} \qquad \vec{x}_{\text{exacta}} = \begin{pmatrix} 1 \\ -2 \\ 3 \end{pmatrix}"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                <p className="text-xs font-medium text-slate-500">Error absoluto en <MathTex math="x_1" /></p>
                <p className="mt-1.5 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                  <MathTex math="|0.9915 - 1| = 0.0085" />
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                <p className="text-xs font-medium text-slate-500">Error absoluto en <MathTex math="x_2" /></p>
                <p className="mt-1.5 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                  <MathTex math="|-1.99054 - (-2)| = 0.00946" />
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                <p className="text-xs font-medium text-slate-500">Error absoluto en <MathTex math="x_3" /></p>
                <p className="mt-1.5 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                  <MathTex math="|2.98 - 3| = 0.0200" />
                </p>
              </div>
            </div>
            <p className="text-[0.95rem] leading-[1.7] text-slate-600">
              <strong>Nota de precisión numérica:</strong> El desarrollo anterior reproduce el
              truncamiento a 3 decimales en la segunda ecuación normalizada (<MathTex math="-0.133" />,{' '}
              <MathTex math="-0.266" />, <MathTex math="-1.066" />) del apunte de cátedra. Al
              ejecutar este mismo sistema en la pestaña <strong>Calculadora</strong> con aritmética
              de doble precisión (fracciones exactas <MathTex math="-\frac{2}{15}, -\frac{4}{15}, -\frac{16}{15}" />
              ), se obtiene <MathTex math="\vec{x}^{(4)} \approx (0.9924,\; -1.9937,\; 2.9800)^T" />,
              convergiendo exactamente a <MathTex math="(1,\; -2,\; 3)^T" /> en iteraciones
              posteriores.
            </p>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-6 py-5">
              <MathTex
                block
                math="\vec{x}^{(3)} = \begin{pmatrix} 1.7 \\ -1.01 \\ 1.2 \end{pmatrix} \qquad \text{vs.} \qquad \vec{x}_{\text{exacta}} = \begin{pmatrix} 2 \\ -1 \\ 1 \end{pmatrix}"
              />
            </div>
            <p className="text-[1.0625rem] leading-[1.75] text-slate-700">
              En solo 3 correcciones (una por cada incógnita), <MathTex math="x_2^{(3)} = -1.01" />{' '}
              ya se encuentra a <MathTex math="0.01" /> del valor exacto, y el residuo máximo se
              redujo desde <MathTex math="1.7" /> hasta <MathTex math="0.322" />. Sin el
              reordenamiento previo de filas, el método no habría podido siquiera inicializarse por
              la división por cero en <MathTex math="a_{11} = 0" />.
            </p>
          </>
        )}
      </section>
    </article>
  );
}
