
export type Language = 'en' | 'ta';

export interface SymptomSuggestion {
  id: string;
  labelEn: string;
  labelTa: string;
}

export interface MedicationGuidance {
  possibleConditionEn: string;
  possibleConditionTa: string;
  medicineEn: string;
  medicineTa: string;
  dosageInfo: {
    infant?: string;
    child?: string;
    adult?: string;
    elderly?: string;
  };
  timingEn: string;
  timingTa: string;
  durationEn: string;
  durationTa: string;
  confidenceScore: number;
  precautionsEn: string[];
  precautionsTa: string[];
}

export interface AppState {
  language: Language;
  symptomsText: string;
  age: number | null;
  step: 'input' | 'confirm' | 'results';
  suggestedSymptoms: SymptomSuggestion[];
  confirmedSymptoms: string[];
  results: MedicationGuidance | null;
  loading: boolean;
  error: string | null;
}
