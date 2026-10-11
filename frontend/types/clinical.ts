// ─────────────────────────────────────────────────────────────
// Clinical Domain Types — The Two-Minute Doctor
// Non-diagnostic. Every extracted datum traces to a source.
// ─────────────────────────────────────────────────────────────

/** Bounding box on an uploaded image (normalised 0-1 coords) */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

/** Provenance link back to the original uploaded artefact */
export interface SourceReference {
  source_id: string;
  document_name: string;
  document_type: 'prescription' | 'lab' | 'discharge_summary' | 'clinic_note' | 'imaging' | 'other';
  uploaded_at: string;          // ISO-8601
  image_url: string;            // URL to the original uploaded image
  bounding_boxes: BoundingBox[];
  confidence: number;           // 0–1 OCR confidence
}

/** A single extracted medication */
export interface ExtractedMedication {
  id: string;
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribed_date: string;      // ISO-8601
  discontinued_date?: string;   // ISO-8601 or null if active
  prescribing_clinic?: string;
  source: SourceReference;
  is_active: boolean;
}

/** Lab result parameter */
export interface LabParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'UNKNOWN';
  date: string;
  source: SourceReference;
}

/** A vital sign reading */
export interface VitalSign {
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'spo2' | 'weight' | 'blood_sugar';
  value: string;
  unit: string;
  date: string;
  source: SourceReference;
}

/** Safety red flag */
export interface RedFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'allergy' | 'drug_interaction' | 'contraindication' | 'duplicate_medication' | 'abnormal_result' | 'renal_risk' | 'hepatic_risk';
  title: string;
  description: string;
  related_medications?: string[];   // medication ids
  related_labs?: string[];          // lab ids
  sources: SourceReference[];
}

/** Timeline event — the atomic unit of the chronological history */
export interface TimelineEvent {
  id: string;
  date: string;                     // ISO-8601
  type: 'medication' | 'lab' | 'procedure' | 'clinic_visit' | 'symptom' | 'imaging' | 'discharge';
  title: string;
  subtitle?: string;
  details: string;
  tags: string[];
  source?: SourceReference;
  related_flags?: string[];         // red-flag ids
}

/** Patient demographics */
export interface PatientDemographics {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  blood_group?: string;
  contact?: string;
  registration_id?: string;
}

/** Voice / text intake record */
export interface IntakeRecord {
  chief_complaint: string;
  complaint_duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  transcript?: string;
  audio_url?: string;
  language: string;
  follow_up_answers: Array<{ question: string; answer: string }>;
  recorded_at: string;
}

/** Uploaded document metadata */
export interface UploadedDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  preview_url: string;
  upload_status: 'uploading' | 'processing' | 'done' | 'error';
  extracted_data?: {
    date?: string;
    type: string;
    clinic_name?: string;
    medications: ExtractedMedication[];
    labs: LabParameter[];
    vitals: VitalSign[];
    findings: string[];
  };
}

/** Adaptive follow-up question generated from patient input */
export interface FollowUpQuestion {
  id: string;
  question: string;
  input_type: 'text' | 'select' | 'duration' | 'severity';
  options?: string[];
  required: boolean;
}

/** The complete patient record assembled for the doctor */
export interface PatientRecord {
  id: string;
  demographics: PatientDemographics;
  intake: IntakeRecord;
  documents: UploadedDocument[];
  timeline: TimelineEvent[];
  medications: ExtractedMedication[];
  labs: LabParameter[];
  vitals: VitalSign[];
  red_flags: RedFlag[];
  reading_time_seconds: number;     // estimated scan time
  generated_at: string;             // ISO-8601
  disclaimer: string;               // non-diagnostic guardrail
}

/** Intake step state */
export type IntakeStep = 'complaint' | 'upload' | 'followup' | 'review';

/** Language option for multi-language support */
export interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
}
