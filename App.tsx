
import React, { useState, useMemo } from 'react';
import { AppState, Language } from './types';
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
        {/* Step-based Content */}
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
                        isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-inner'
                        : 'border-slate-100 hover:border-teal-200 bg-white shadow-sm'
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
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
                  className="px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{t.backBtn}</span>
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-grow bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center space-x-2 group"
                >
                  <span>{t.getResultsBtn}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {!state.loading && state.step === 'results' && state.results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Main Result Card */}
              <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-8 md:p-12 text-white relative">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-teal-100 mb-2 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-teal-300 mr-2 animate-pulse"></span>
                        {t.resultsTitle}
                      </h2>
                      <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {state.language === 'en' ? state.results.medicineEn : state.results.medicineTa}
                      </h3>
                    </div>
                    <div className="bg-white/15 px-4 py-2 rounded-2xl text-sm font-black backdrop-blur-xl border border-white/20 flex items-center space-x-2">
                      <span className="text-teal-50">{t.confidenceLabel}:</span>
                      <span className="text-white text-lg">{state.results.confidenceScore}%</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center space-x-3 bg-black/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-teal-50 font-bold text-lg">
                      {t.conditionLabel}: <span className="text-white">{state.language === 'en' ? state.results.possibleConditionEn : state.results.possibleConditionTa}</span>
                    </p>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                  {/* Dosage Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="flex items-center text-slate-900 font-black text-xl tracking-tight">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3 text-teal-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        {t.dosageLabel}
                      </h4>
                      {!state.age && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                          {t.allAges}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(state.results.dosageInfo).map(([group, dosage]) => {
                        const isPrimary = (state.age !== null && (
                          (state.age <= 2 && group === 'infant') || 
                          (state.age > 2 && state.age <= 12 && group === 'child') ||
                          (state.age > 12 && state.age < 65 && group === 'adult') ||
                          (state.age >= 65 && group === 'elderly')
                        ));
                        return (
                          <div 
                            key={group} 
                            className={`p-6 rounded-3xl border transition-all duration-300 ${
                              isPrimary 
                              ? 'bg-teal-50/80 border-teal-200 ring-2 ring-teal-500/10 shadow-lg scale-[1.02]' 
                              : 'bg-slate-50/50 border-slate-100 opacity-60'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{group}</span>
                            <p className="text-slate-900 font-extrabold text-lg leading-tight">{dosage || 'Not Recommended'}</p>
                            {isPrimary && (
                              <div className="mt-3 flex items-center text-teal-600 text-[10px] font-black tracking-widest uppercase">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Matched for your age
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Timing & Duration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm">
                      <h5 className="text-blue-900 font-black mb-4 flex items-center text-lg uppercase tracking-tight">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        {t.timingLabel}
                      </h5>
                      <p className="text-blue-800 font-bold text-xl leading-relaxed">{state.language === 'en' ? state.results.timingEn : state.results.timingTa}</p>
                    </div>
                    <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-sm">
                      <h5 className="text-indigo-900 font-black mb-4 flex items-center text-lg uppercase tracking-tight">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        {t.durationLabel}
                      </h5>
                      <p className="text-indigo-800 font-bold text-xl leading-relaxed">{state.language === 'en' ? state.results.durationEn : state.results.durationTa}</p>
                    </div>
                  </div>

                  {/* Precautions Section */}
                  <section className="space-y-6">
                    <h4 className="flex items-center text-slate-900 font-black text-xl tracking-tight">
                      <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center mr-3 text-rose-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      {t.precautionsLabel}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {(state.language === 'en' ? state.results.precautionsEn : state.results.precautionsTa).map((p, idx) => (
                        <div key={idx} className="flex items-start bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 mr-4 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                          <span className="text-slate-700 font-semibold leading-relaxed">{p}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-rose-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 block mb-1">Medical Disclaimer</span>
                    <p className="text-rose-900 text-sm leading-relaxed font-bold italic">
                      {t.disclaimer}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center space-x-4 group active:scale-[0.98]"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <span className="text-lg">{t.resetBtn}</span>
              </button>
            </div>
          )}

          {state.error && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 animate-in slide-in-from-bottom-10">
              <div className="bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-rose-500">
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-sm">{state.error}</span>
                </div>
                <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 py-12 text-center bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm uppercase tracking-widest">
              <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span>SymptoCure</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
              {t.privacyNote} • © {new Date().getFullYear()} Health Tech Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
