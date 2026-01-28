
import React, { useState, useMemo } from 'react';
import { AppState } from './types';
import { strings } from './translations';
import { getSymptomSuggestions, getMedicationGuidance } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    symptomsText: '',
    age: null,
    step: 'input',
    suggestedSymptoms: [],
    confirmedSymptoms: [],
    results: null,
    loading: false,
    error: null,
  });

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'ta' : 'en' }));
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.symptomsText.trim()) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const suggestions = await getSymptomSuggestions(state.symptomsText);
      setState(prev => ({
        ...prev,
        suggestedSymptoms: suggestions,
        step: 'confirm',
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: 'Unable to analyze symptoms. Please try again with more detail.' }));
    }
  };

  const handleConfirmSubmit = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const allSymptoms = [state.symptomsText, ...state.confirmedSymptoms];
      const guidance = await getMedicationGuidance(allSymptoms, state.age);
      setState(prev => ({
        ...prev,
        results: guidance,
        step: 'results',
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: 'Unable to generate guidance. Please consult a professional.' }));
    }
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      symptomsText: '',
      age: null,
      step: 'input',
      suggestedSymptoms: [],
      confirmedSymptoms: [],
      results: null,
      loading: false,
      error: null,
    }));
  };

  const t = useMemo(() => strings[state.language], [state.language]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={reset}>
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">{t.title}</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">{t.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center space-x-2 active:scale-95"
          >
            <span className="opacity-70">Language:</span>
            <span className="text-teal-600">{state.language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="relative">
          {state.loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 border-[5px] border-slate-100 rounded-full"></div>
                <div className="w-16 h-16 border-[5px] border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-500 font-semibold text-lg tracking-tight">{t.loadingText}</p>
            </div>
          )}

          {!state.loading && state.step === 'input' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{state.language === 'en' ? 'How are you feeling today?' : 'இன்று உங்கள் உடல்நிலை எப்படி இருக்கிறது?'}</h2>
                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">{t.description}</p>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-6 md:p-10">
                <form onSubmit={handleInitialSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {state.language === 'en' ? 'Symptoms' : 'அறிகுறிகள்'}
                    </label>
                    <textarea
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-lg min-h-[140px] bg-slate-50/50 placeholder:text-slate-300"
                      placeholder={t.symptomsPlaceholder}
                      value={state.symptomsText}
                      onChange={(e) => setState(prev => ({ ...prev, symptomsText: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.ageLabel}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all bg-slate-50/50"
                        placeholder={t.agePlaceholder}
                        value={state.age === null ? '' : state.age}
                        onChange={(e) => {
                          const val = e.target.value;
                          setState(prev => ({ ...prev, age: val === '' ? null : parseInt(val) }));
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center space-x-3 group active:scale-[0.98]"
                    >
                      <span>{t.submitBtn}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </form>
                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center text-slate-400 text-xs font-medium space-x-2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-teal-500/50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 3.89 2.421 7.221 5.823 8.513l.37.142.37-.142c3.402-1.292 5.823-4.603 5.823-8.513 0-1.293-.205-2.538-.582-3.704a11.99 11.99 0 00-5.672-3.68z" />
                  </svg>
                  <span>{t.privacyNote}</span>
                </div>
              </div>
            </div>
          )}

          {!state.loading && state.step === 'confirm' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-2">{t.confirmTitle}</h2>
                <p className="text-slate-500 font-medium">{t.confirmDesc}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {state.suggestedSymptoms.map((symptom) => {
                  const label = state.language === 'en' ? symptom.labelEn : symptom.labelTa;
                  const isSelected = state.confirmedSymptoms.includes(label);
                  return (
                    <label 
                      key={symptom.id}
                      className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-teal-500 bg-teal-50/50 shadow-inner' : 'border-slate-100 hover:border-teal-200 bg-white shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-6 h-6 text-teal-600 border-slate-300 rounded-lg focus:ring-teal-500 focus:ring-offset-0 transition-all"
                        checked={isSelected}
                        onChange={(e) => {
                          setState(prev => ({
                            ...prev,
                            confirmedSymptoms: e.target.checked
                              ? [...prev.confirmedSymptoms, label]
                              : prev.confirmedSymptoms.filter(s => s !== label)
                          }));
                        }}
                      />
                      <span className={`ml-4 text-sm font-bold ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setState(prev => ({ ...prev, step: 'input' }))} className="px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center space-x-2">
                  <span>{t.backBtn}</span>
                </button>
                <button onClick={handleConfirmSubmit} className="flex-grow bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-2">
                  <span>{t.getResultsBtn}</span>
                </button>
              </div>
            </div>
          )}

          {!state.loading && state.step === 'results' && state.results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-8 md:p-12 text-white relative">
                   <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-teal-100 mb-2">{t.resultsTitle}</h2>
                    <h3 className="text-4xl md:text-5xl font-black">{state.language === 'en' ? state.results.medicineEn : state.results.medicineTa}</h3>
                  </div>
                  <div className="mt-8 bg-black/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <p className="text-teal-50 font-bold">
                      {t.conditionLabel}: <span className="text-white">{state.language === 'en' ? state.results.possibleConditionEn : state.results.possibleConditionTa}</span>
                    </p>
                  </div>
                </div>
                <div className="p-8 md:p-12 space-y-12">
                   <section>
                    <h4 className="text-slate-900 font-black text-xl mb-6">{t.dosageLabel}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(state.results.dosageInfo).map(([group, dosage]) => (
                        <div key={group} className="p-6 rounded-3xl border bg-slate-50/50 border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{group}</span>
                          <p className="text-slate-900 font-extrabold text-lg">{dosage || 'Not Recommended'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                      <h5 className="text-blue-900 font-black mb-4 flex items-center text-lg">{t.timingLabel}</h5>
                      <p className="text-blue-800 font-bold text-xl">{state.language === 'en' ? state.results.timingEn : state.results.timingTa}</p>
                    </div>
                    <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                      <h5 className="text-indigo-900 font-black mb-4 flex items-center text-lg">{t.durationLabel}</h5>
                      <p className="text-indigo-800 font-bold text-xl">{state.language === 'en' ? state.results.durationEn : state.results.durationTa}</p>
                    </div>
                  </div>
                  <section className="space-y-6">
                    <h4 className="text-slate-900 font-black text-xl">{t.precautionsLabel}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {(state.language === 'en' ? state.results.precautionsEn : state.results.precautionsTa).map((p, idx) => (
                        <div key={idx} className="flex items-start bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 mr-4 flex-shrink-0"></div>
                          <span className="text-slate-700 font-semibold leading-relaxed">{p}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
              <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-8">
                <p className="text-rose-900 text-sm leading-relaxed font-bold italic">{t.disclaimer}</p>
              </div>
              <button onClick={reset} className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl shadow-2xl flex items-center justify-center space-x-4 group">
                <span className="text-lg">{t.resetBtn}</span>
              </button>
            </div>
          )}

          {state.error && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
              <div className="bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between">
                <span className="font-bold text-sm">{state.error}</span>
                <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="bg-white/20 p-1.5 rounded-lg">×</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 py-12 text-center bg-white">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.privacyNote} • © {new Date().getFullYear()} Health Tech Solutions</p>
      </footer>
    </div>
  );
};

export default App;
