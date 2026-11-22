import { useState } from 'react';
import { BookOpen, Calculator, Code2, FileCheck2 } from 'lucide-react';
import { TheorySection } from './components/TheorySection';
import { AlgorithmSection } from './components/AlgorithmSection';
import { ExercisesSection, type ExercisePreset } from './components/ExercisesSection';
import { CalculatorSection } from './components/CalculatorSection';

type TabId = 'teoria' | 'algoritmo' | 'ejercicios' | 'calculadora';

interface TabItem {
  id: TabId;
  label: string;
  icon: typeof BookOpen;
}

const TABS: TabItem[] = [
  { id: 'teoria', label: 'Teoría', icon: BookOpen },
  { id: 'algoritmo', label: 'Algoritmo', icon: Code2 },
  { id: 'ejercicios', label: 'Ejercicios Resueltos', icon: FileCheck2 },
  { id: 'calculadora', label: 'Calculadora', icon: Calculator },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('teoria');
  const [calculatorPreset, setCalculatorPreset] = useState<{
    preset: ExercisePreset;
    nonce: number;
  } | null>(null);

  const handleLoadInCalculator = (preset: ExercisePreset) => {
    setCalculatorPreset({ preset, nonce: Date.now() });
    setActiveTab('calculadora');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Institutional Masthead */}
      <header className="border-b border-slate-200/90 bg-white shadow-xs">
        <div className="mx-auto w-full max-w-7xl xl:max-w-[1320px] px-4 pt-8 sm:px-6 lg:px-8">
          <div className="pb-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A8A]">
              Cátedra de Análisis Numérico · Ingeniería en Sistemas
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#172554] sm:text-4xl">
              Método de Relajación — Análisis Numérico
            </h1>
            <p className="mt-2.5 text-base text-slate-600 sm:text-[1.125rem]">
              Resolución Iterativa de Sistemas de Ecuaciones Lineales
            </p>
          </div>

          {/* Structured 4-Tab Navigation Bar */}
          <nav
            aria-label="Secciones principales"
            className="grid grid-cols-2 gap-2 pb-3 sm:-mb-px sm:flex sm:items-center sm:gap-2 sm:pb-0"
            role="tablist"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E3A8A] sm:min-h-0 sm:justify-start sm:rounded-t-xl sm:rounded-b-none sm:border-0 sm:border-b-[3px] sm:px-5 sm:py-3.5 sm:text-[0.975rem] ${
                    isActive
                      ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white font-semibold shadow-xs sm:bg-[#1E3A8A]/[0.06] sm:text-[#1E3A8A] sm:shadow-none'
                      : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 hover:text-[#1E3A8A] sm:border-transparent sm:bg-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Academic Content Area */}
      <main className="mx-auto w-full max-w-7xl xl:max-w-[1320px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'teoria' && <TheorySection />}
          {activeTab === 'algoritmo' && <AlgorithmSection />}
          {activeTab === 'ejercicios' && (
            <ExercisesSection onLoadInCalculator={handleLoadInCalculator} />
          )}
          {activeTab === 'calculadora' && (
            <CalculatorSection externalPreset={calculatorPreset} />
          )}
        </div>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl xl:max-w-[1320px] flex-col items-start justify-between gap-2 px-4 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="font-serif text-slate-600">
            Análisis Numérico · Resolución Iterativa de Sistemas de Ecuaciones Lineales
          </p>
          <p>Material didáctico universitario — Método de Relajación</p>
        </div>
      </footer>
    </div>
  );
}
