export interface FeatureScores {
  full_name_similarity: number;
  first_name_similarity: number;
  last_name_similarity: number;
  skills_cosine: number;
  employment_jaccard: number;
  education_overlap: number;
  job_title_similarity: number;
  latest_work_experience_similarity: number;
  latest_education_similarity: number;
  address_country_match: number;
  address_state_match: number;
  address_city_match: number;
  [key: string]: number;
}

export interface ProfileDetails {
  icims_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  address_country: string;
  country_code: string;
  address_state: string;
  address_city: string;
  address_street: string;
  address_street2: string;
  address_zip: string;
  email: string;
  email_canonical: string;
  phone_number: string;
  phone_canonical: string;
  github_raw: string;
  linkedIn: string;
  is_prospect: number;
  resume: string;
  all_phones: string;
  all_emails: string;
  all_socials: string;
  school_name: string;
  schools_names: string;
  employer_name: string;
  employers_names: string;
  job_name: string;
  jobs_names: string;
  skills: string;
  qualifications_names: string;
  latest_education_detail: string;
  latest_work_experience_detail: string;
  education_details: string;
  work_experience_details: string;
  processor_version: string;
}

export interface Profile {
  id: string;
  details: ProfileDetails;
}

export interface ComparisonData {
  query_profile: Profile;
  matched_profile: Profile;
  label_type: string;
  ground_truth_label: number;
  llm_analysis: {
    duplicate_probability: number;
    feature_scores: FeatureScores;
    verdict: boolean;
    summary: string;
  };
}
