import type { BestPracticeQuestionId } from './types'

export interface QuestionConfig {
  id: BestPracticeQuestionId
  prompt: string
}

export const bestPracticeQuestionsConfig: QuestionConfig[] = [
  {
    id: 'q1_digestive_issues',
    prompt:
      'Do you experience digestive discomfort (bloating, gas, irregular bowel movements) more than twice per week?',
  },
  {
    id: 'q2_sleep_quality',
    prompt: 'Do you wake feeling unrested, even after 7-8 hours of sleep?',
  },
  { id: 'q3_medications', prompt: 'Have you taken antibiotics or long-term medication in the past 2 years?' },
  {
    id: 'q4_processed_foods',
    prompt: 'Do you consume processed foods or eat out more than 3 times per week?',
  },
  {
    id: 'q5_energy_crashes',
    prompt: 'Do you experience afternoon energy crashes or rely on caffeine to function?',
  },
  { id: 'q6_water_intake', prompt: 'Do you drink less than 2 liters of water daily?' },
  {
    id: 'q7_toxic_exposure',
    prompt: 'Have you been exposed to environmental toxins (old homes, industrial areas, amalgam fillings)?',
  },
  {
    id: 'q8_symptoms',
    prompt: 'Do you experience skin issues, headaches, or brain fog regularly?',
  },
  {
    id: 'q9_supplements',
    prompt: "Do you rarely take supplements or aren't sure if they're working?",
  },
  {
    id: 'q10_unresolved_issues',
    prompt: 'Have you struggled to resolve a health concern despite trying multiple approaches?',
  },
]

export const qualifyingQuestions = [
  {
    name: 'current_situation',
    prompt: 'Which best describes your current health situation?',
    options: [
      { value: 'just_beginning', label: 'Just beginning to focus on my health' },
      { value: 'managing_chronic', label: 'Actively managing some chronic symptoms' },
      { value: 'years_no_resolution', label: 'Been working on health issues for years without resolution' },
      { value: 'generally_healthy', label: 'Generally healthy but want to optimize and prevent future issues' },
      { value: 'recovering', label: 'Recovering from illness and seeking maintenance' },
    ] as const,
  },
  {
    name: 'primary_goal',
    prompt: 'What is your primary health goal for the next 90 days?',
    options: [
      { value: 'resolve_digestive', label: 'Resolve digestive issues and restore gut health' },
      { value: 'increase_energy', label: 'Increase energy and mental clarity' },
      { value: 'address_toxic_load', label: 'Understand and address potential toxic load' },
      { value: 'lose_weight', label: 'Lose weight in a healthy, sustainable way' },
      { value: 'address_specific_symptoms', label: 'Address specific symptoms (skin, hormones, sleep, etc.)' },
      { value: 'optimize_health', label: 'Comprehensive health optimization' },
    ] as const,
  },
  {
    name: 'biggest_obstacle',
    prompt: 'What has been your biggest obstacle to achieving better health?',
    options: [
      { value: 'dont_know_where_to_start', label: "Not knowing where to start or what's really wrong" },
      { value: 'tried_many_things', label: 'Tried many things but nothing seems to work' },
      { value: 'conflicting_information', label: 'Conflicting information and advice' },
      { value: 'cost_of_care', label: 'Cost of testing and treatments' },
      { value: 'not_enough_time', label: 'Not enough time to focus on health' },
      { value: 'dismissed_by_practitioners', label: 'Medical practitioners dismissing my concerns' },
    ] as const,
  },
  {
    name: 'preferred_support',
    prompt: 'What type of support would best suit you?',
    options: [
      { value: 'self_guided', label: 'Self-guided resources and educational content' },
      { value: 'one_time_consult', label: 'One-time consultation and personalized plan' },
      { value: 'comprehensive_testing', label: 'Comprehensive testing (e.g., Oligoscan) + treatment plan' },
      { value: 'ongoing_support', label: 'Ongoing support with custom herbal formulations' },
      { value: 'full_service_partnership', label: 'Full-service health partnership with regular monitoring' },
    ] as const,
  },
]

export const notesQuestion = {
  name: 'additional_notes',
  prompt: 'Is there anything else you would like us to know about your health journey?',
  placeholder:
    'Share specific concerns, previous diagnoses, or what prompted you to take this assessment today…',
}
