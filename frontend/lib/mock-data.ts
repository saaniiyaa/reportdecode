import {
  PatientRecord,
  TimelineEvent,
  RedFlag,
  ExtractedMedication,
  LabParameter,
  SourceReference,
  VitalSign,
} from '@/types/clinical';

// ─────────────────────────────────────────────────────────────
// Mock source references (provenance links to uploaded images)
// ─────────────────────────────────────────────────────────────
const prescriptionSource: SourceReference = {
  source_id: 'src-001',
  document_name: 'Dr_Sharma_Prescription_Nov2023.jpg',
  document_type: 'prescription',
  uploaded_at: '2024-10-11T09:30:00+05:30',
  image_url: '/mock/prescription-1.jpg',
  bounding_boxes: [{ x: 0.05, y: 0.30, width: 0.90, height: 0.15 }],
  confidence: 0.94,
};

const labSource: SourceReference = {
  source_id: 'src-002',
  document_name: 'SRL_Diagnostics_KFT_Jan2024.jpg',
  document_type: 'lab',
  uploaded_at: '2024-10-11T09:31:00+05:30',
  image_url: '/mock/lab-report-1.jpg',
  bounding_boxes: [{ x: 0.10, y: 0.25, width: 0.80, height: 0.50 }],
  confidence: 0.97,
};

const dischargeSource: SourceReference = {
  source_id: 'src-003',
  document_name: 'AIIMS_Discharge_Summary_Mar2024.jpg',
  document_type: 'discharge_summary',
  uploaded_at: '2024-10-11T09:32:00+05:30',
  image_url: '/mock/discharge-summary.jpg',
  bounding_boxes: [{ x: 0.05, y: 0.10, width: 0.90, height: 0.30 }],
  confidence: 0.91,
};

const clinicNoteSource: SourceReference = {
  source_id: 'src-004',
  document_name: 'City_Clinic_Followup_Sep2024.jpg',
  document_type: 'clinic_note',
  uploaded_at: '2024-10-11T09:33:00+05:30',
  image_url: '/mock/clinic-note.jpg',
  bounding_boxes: [{ x: 0.10, y: 0.40, width: 0.80, height: 0.20 }],
  confidence: 0.89,
};

// ─────────────────────────────────────────────────────────────
// Medications
// ─────────────────────────────────────────────────────────────
const medications: ExtractedMedication[] = [
  {
    id: 'med-001',
    name: 'Amlodipine',
    generic_name: 'Amlodipine Besylate',
    dosage: '5 mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescribed_date: '2023-11-12',
    prescribing_clinic: 'Dr. R.K. Sharma, City Heart Clinic',
    source: prescriptionSource,
    is_active: true,
  },
  {
    id: 'med-002',
    name: 'Metformin',
    generic_name: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Twice daily',
    route: 'Oral',
    prescribed_date: '2023-11-12',
    prescribing_clinic: 'Dr. R.K. Sharma, City Heart Clinic',
    source: prescriptionSource,
    is_active: true,
  },
  {
    id: 'med-003',
    name: 'Atorvastatin',
    generic_name: 'Atorvastatin Calcium',
    dosage: '20 mg',
    frequency: 'Once daily at night',
    route: 'Oral',
    prescribed_date: '2024-03-15',
    prescribing_clinic: 'AIIMS, New Delhi',
    source: dischargeSource,
    is_active: true,
  },
  {
    id: 'med-004',
    name: 'Amoxicillin',
    generic_name: 'Amoxicillin Trihydrate',
    dosage: '500 mg',
    frequency: 'Three times daily',
    route: 'Oral',
    prescribed_date: '2024-01-20',
    discontinued_date: '2024-01-27',
    prescribing_clinic: 'PHC Bahadurgarh',
    source: clinicNoteSource,
    is_active: false,
  },
  {
    id: 'med-005',
    name: 'Pantoprazole',
    generic_name: 'Pantoprazole Sodium',
    dosage: '40 mg',
    frequency: 'Once daily before breakfast',
    route: 'Oral',
    prescribed_date: '2024-03-15',
    prescribing_clinic: 'AIIMS, New Delhi',
    source: dischargeSource,
    is_active: true,
  },
  {
    id: 'med-006',
    name: 'Aspirin',
    generic_name: 'Acetylsalicylic acid',
    dosage: '75 mg',
    frequency: 'Once daily after lunch',
    route: 'Oral',
    prescribed_date: '2024-03-15',
    prescribing_clinic: 'AIIMS, New Delhi',
    source: dischargeSource,
    is_active: true,
  },
];

// ─────────────────────────────────────────────────────────────
// Lab Results
// ─────────────────────────────────────────────────────────────
const labs: LabParameter[] = [
  { id: 'lab-001', name: 'Creatinine', value: 1.8, unit: 'mg/dL', reference_range: '0.7 – 1.3', status: 'HIGH', date: '2024-01-15', source: labSource },
  { id: 'lab-002', name: 'Blood Urea', value: 52, unit: 'mg/dL', reference_range: '13 – 43', status: 'HIGH', date: '2024-01-15', source: labSource },
  { id: 'lab-003', name: 'eGFR', value: 48, unit: 'mL/min/1.73m²', reference_range: '> 60', status: 'LOW', date: '2024-01-15', source: labSource },
  { id: 'lab-004', name: 'HbA1c', value: 7.8, unit: '%', reference_range: '4.0 – 5.6', status: 'HIGH', date: '2024-01-15', source: labSource },
  { id: 'lab-005', name: 'Fasting Glucose', value: 142, unit: 'mg/dL', reference_range: '70 – 100', status: 'HIGH', date: '2024-01-15', source: labSource },
  { id: 'lab-006', name: 'Uric Acid', value: 5.5, unit: 'mg/dL', reference_range: '3.5 – 7.2', status: 'NORMAL', date: '2024-01-15', source: labSource },
  { id: 'lab-007', name: 'Calcium, Total', value: 9.8, unit: 'mg/dL', reference_range: '8.7 – 10.4', status: 'NORMAL', date: '2024-01-15', source: labSource },
  { id: 'lab-008', name: 'Potassium', value: 5.6, unit: 'mEq/L', reference_range: '3.5 – 5.0', status: 'HIGH', date: '2024-01-15', source: labSource },
];

// ─────────────────────────────────────────────────────────────
// Vitals
// ─────────────────────────────────────────────────────────────
const vitals: VitalSign[] = [
  { type: 'blood_pressure', value: '148/92', unit: 'mmHg', date: '2024-09-20', source: clinicNoteSource },
  { type: 'heart_rate', value: '82', unit: 'bpm', date: '2024-09-20', source: clinicNoteSource },
  { type: 'spo2', value: '97', unit: '%', date: '2024-09-20', source: clinicNoteSource },
  { type: 'blood_sugar', value: '156', unit: 'mg/dL', date: '2024-09-20', source: clinicNoteSource },
  { type: 'weight', value: '78', unit: 'kg', date: '2024-09-20', source: clinicNoteSource },
];

// ─────────────────────────────────────────────────────────────
// Red Flags
// ─────────────────────────────────────────────────────────────
const redFlags: RedFlag[] = [
  {
    id: 'rf-001',
    severity: 'critical',
    category: 'allergy',
    title: 'Penicillin Allergy Documented',
    description: 'Patient allergy to Penicillin recorded on prescription dated 12-Nov-2023 (Dr. R.K. Sharma). Amoxicillin (a penicillin-type antibiotic) was prescribed on 20-Jan-2024 at PHC Bahadurgarh.',
    related_medications: ['med-004'],
    sources: [prescriptionSource, clinicNoteSource],
  },
  {
    id: 'rf-002',
    severity: 'critical',
    category: 'renal_risk',
    title: 'Elevated Creatinine with Reduced eGFR',
    description: 'Creatinine 1.8 mg/dL (Ref: 0.7–1.3) and eGFR 48 mL/min (Ref: >60) suggest reduced kidney function (Stage 3a CKD range). Metformin dosage may require physician review.',
    related_medications: ['med-002'],
    related_labs: ['lab-001', 'lab-003'],
    sources: [labSource],
  },
  {
    id: 'rf-003',
    severity: 'warning',
    category: 'abnormal_result',
    title: 'Elevated Potassium (Hyperkalemia Risk)',
    description: 'Serum Potassium 5.6 mEq/L (Ref: 3.5–5.0). Elevated potassium can be associated with impaired renal function. Found alongside elevated Creatinine.',
    related_labs: ['lab-008'],
    sources: [labSource],
  },
  {
    id: 'rf-004',
    severity: 'warning',
    category: 'drug_interaction',
    title: 'Aspirin + Metformin Interaction',
    description: 'Concurrent use of Aspirin and Metformin may increase risk of hypoglycemia. Both are currently active. Documented across two different prescribers.',
    related_medications: ['med-002', 'med-006'],
    sources: [prescriptionSource, dischargeSource],
  },
  {
    id: 'rf-005',
    severity: 'info',
    category: 'abnormal_result',
    title: 'HbA1c Above Target',
    description: 'HbA1c 7.8% (Ref: 4.0–5.6) indicates above-normal average blood glucose over the past 2–3 months. Current Metformin 500mg BD is documented.',
    related_medications: ['med-002'],
    related_labs: ['lab-004'],
    sources: [labSource],
  },
];

// ─────────────────────────────────────────────────────────────
// Timeline Events
// ─────────────────────────────────────────────────────────────
const timeline: TimelineEvent[] = [
  {
    id: 'evt-001',
    date: '2023-11-12',
    type: 'clinic_visit',
    title: 'Initial Consultation — Dr. R.K. Sharma',
    subtitle: 'City Heart Clinic, Rohini',
    details: 'Patient presented with chest tightness and elevated BP. Amlodipine 5mg OD and Metformin 500mg BD initiated. Penicillin allergy documented.',
    tags: ['Hypertension', 'Diabetes', 'Allergy'],
    source: prescriptionSource,
    related_flags: ['rf-001'],
  },
  {
    id: 'evt-002',
    date: '2024-01-15',
    type: 'lab',
    title: 'Kidney Function Test — SRL Diagnostics',
    subtitle: 'KFT + Glucose Panel',
    details: 'Creatinine 1.8, eGFR 48, Blood Urea 52, HbA1c 7.8%, Fasting Glucose 142, Potassium 5.6. Multiple parameters outside reference range.',
    tags: ['KFT', 'Renal', 'Diabetes'],
    source: labSource,
    related_flags: ['rf-002', 'rf-003', 'rf-005'],
  },
  {
    id: 'evt-003',
    date: '2024-01-20',
    type: 'medication',
    title: 'Amoxicillin Prescribed — PHC Bahadurgarh',
    subtitle: '500mg TDS × 7 days for respiratory infection',
    details: 'Amoxicillin 500mg prescribed for upper respiratory tract infection. NOTE: Penicillin allergy was documented on earlier prescription from Dr. Sharma.',
    tags: ['Antibiotic', 'Allergy Conflict'],
    source: clinicNoteSource,
    related_flags: ['rf-001'],
  },
  {
    id: 'evt-004',
    date: '2024-03-10',
    type: 'symptom',
    title: 'Chest Pain Episode',
    details: 'Patient reports retrosternal discomfort with exertion, lasting ~10 minutes, relieved by rest. No radiation to arm reported.',
    tags: ['Cardiac', 'Symptom'],
  },
  {
    id: 'evt-005',
    date: '2024-03-15',
    type: 'discharge',
    title: 'Discharge — AIIMS, New Delhi',
    subtitle: 'Cardiology Ward, 3-day admission',
    details: 'Admitted for evaluation of chest pain. Coronary angiography performed — no significant stenosis. Atorvastatin 20mg, Pantoprazole 40mg, and Aspirin 75mg added to regimen.',
    tags: ['Cardiology', 'Procedure', 'Discharge'],
    source: dischargeSource,
  },
  {
    id: 'evt-006',
    date: '2024-09-20',
    type: 'clinic_visit',
    title: 'Follow-up Visit — City Clinic',
    subtitle: 'Routine BP and sugar check',
    details: 'BP 148/92 mmHg, HR 82 bpm, SpO2 97%, Random BSL 156 mg/dL. Weight 78 kg. Advised dietary modification and medication compliance.',
    tags: ['Follow-up', 'Vitals'],
    source: clinicNoteSource,
  },
  {
    id: 'evt-007',
    date: '2024-10-11',
    type: 'symptom',
    title: 'Current Complaint — Breathlessness',
    details: 'Patient reports mild breathlessness on climbing stairs (Grade II dyspnea) for past 2 weeks. No orthopnea or PND. Associated with mild ankle swelling in evenings.',
    tags: ['Respiratory', 'Cardiac', 'Current'],
  },
];

// ─────────────────────────────────────────────────────────────
// Complete Patient Record
// ─────────────────────────────────────────────────────────────
export const MOCK_PATIENT: PatientRecord = {
  id: 'patient-001',
  demographics: {
    name: 'Rajesh Kumar Verma',
    age: 58,
    gender: 'M',
    blood_group: 'B+',
    contact: '+91 98765 43210',
    registration_id: 'DH-2024-14873',
  },
  intake: {
    chief_complaint: 'Breathlessness on exertion for 2 weeks with mild ankle swelling in evenings',
    complaint_duration: '2 weeks',
    severity: 'moderate',
    transcript: 'Mujhe seedhiyan chadhte waqt saans phoolti hai, lagbhag do hafte se. Shaam ko pair me thoda sujan aata hai. Dard nahi hai lekin thakan bahut hoti hai.',
    language: 'Hindi',
    follow_up_answers: [
      { question: 'Do you feel breathless while lying flat?', answer: 'No, only when climbing stairs or walking fast' },
      { question: 'Any chest pain or tightness?', answer: 'No chest pain currently. Had episode in March this year.' },
      { question: 'Are you taking all your medications regularly?', answer: 'Yes, mostly. Sometimes I skip Metformin if I eat less.' },
    ],
    recorded_at: '2024-10-11T09:25:00+05:30',
  },
  documents: [
    { id: 'doc-001', file_name: 'Dr_Sharma_Prescription_Nov2023.jpg', file_type: 'image/jpeg', file_size: 2400000, preview_url: '/mock/prescription-1.jpg', upload_status: 'done' },
    { id: 'doc-002', file_name: 'SRL_Diagnostics_KFT_Jan2024.jpg', file_type: 'image/jpeg', file_size: 1800000, preview_url: '/mock/lab-report-1.jpg', upload_status: 'done' },
    { id: 'doc-003', file_name: 'AIIMS_Discharge_Summary_Mar2024.jpg', file_type: 'image/jpeg', file_size: 3100000, preview_url: '/mock/discharge-summary.jpg', upload_status: 'done' },
    { id: 'doc-004', file_name: 'City_Clinic_Followup_Sep2024.jpg', file_type: 'image/jpeg', file_size: 1500000, preview_url: '/mock/clinic-note.jpg', upload_status: 'done' },
  ],
  timeline,
  medications,
  labs,
  vitals,
  red_flags: redFlags,
  reading_time_seconds: 48,
  generated_at: '2024-10-11T09:35:00+05:30',
  disclaimer: 'This summary is auto-generated for pre-consultation review only. It does not constitute a clinical diagnosis or treatment recommendation. All extracted data references the original uploaded documents. Verify all facts before clinical decision-making.',
};
