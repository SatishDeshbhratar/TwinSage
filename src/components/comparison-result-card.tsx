import { VerdictType, getVerdict, saveVerdict } from "@/pages/verdictHandler";
import { ComparisonData, ProfileDetails } from "@/ts/types/comparison";
import { useState, useEffect } from "react";
import { ProfileCard } from "./profile-card";
import { ConfidenceBadge, DecisionBadge } from "./badge";
import { FeatureDetailsTable } from "./feature-details-table";
import { Info } from "lucide-react";

const getProfileValueForFeature = (
  details: ProfileDetails,
  featureName: string,
): string => {
  if (!details) return 'N/A';
  switch (featureName) {
    case 'full_name_similarity':
      return details.full_name || 'N/A';
    case 'first_name_similarity':
      return details.first_name || 'N/A';
    case 'last_name_similarity':
      return details.last_name || 'N/A';
    case 'skills_cosine':
      return details.skills || 'N/A';
    case 'employment_jaccard':
      return details.employers_names || 'N/A';
    case 'education_overlap':
      return details.education_details || 'N/A';
    case 'job_title_similarity':
      return details.job_name || 'N/A';
    case 'latest_work_experience_similarity':
      return details.latest_work_experience_detail || 'N/A';
    case 'latest_education_similarity':
      return details.latest_education_detail || 'N/A';
    case 'address_country_match':
      return details.address_country || 'N/A';
    case 'address_state_match':
      return details.address_state || 'N/A';
    case 'address_city_match':
      return details.address_city || 'N/A';
    default:
      return 'N/A';
  }
};

// Add the SummaryBox component
const SummaryBox = ({ summary }: { summary: string }) => { 
  return ( 
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"> 
      <div className="flex items-start"> 
        <div className="flex-shrink-0 pt-0.5"> 
          <Info className="h-5 w-5 text-blue-500" /> 
        </div> 
        <div className="ml-3"> 
          <h3 className="text-sm font-medium text-blue-800">Analysis Summary</h3> 
          <div className="mt-2 text-sm text-blue-700"> 
            <p>{summary}</p>
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 

// Helper function to generate feature descriptions
const getFeatureDescription = (
  featureName: string,
  profile1: ProfileDetails,
  profile2: ProfileDetails,
): string => {
  const getValue = (profile: ProfileDetails | undefined, key: string) => {
    if (!profile) return 'N/A';
    return getProfileValueForFeature(profile, key);
  };

  const value1 = getValue(profile1, featureName);
  const value2 = getValue(profile2, featureName);

  return `Comparing "${value1}" with "${value2}"`;
};

export const ComparisonResultCard = ({ comparison }: { comparison: ComparisonData }) => {
  const [userVerdict, setUserVerdict] = useState<VerdictType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load existing verdict
    const verdict = getVerdict(
      comparison.query_profile.id,
      comparison.matched_profile.id,
    );
    setUserVerdict(verdict);
  }, [comparison]);

  const handleVerdict = (verdict: VerdictType) => {
    setIsSubmitting(true);
    try {
      saveVerdict(
        comparison.query_profile.id,
        comparison.matched_profile.id,
        verdict,
      );
      setUserVerdict(verdict);
    } catch (error) {
      console.error('Error saving verdict:', error);
    }
    setIsSubmitting(false);
  };

  // Add null checks and default values
  const llmAnalysis = comparison?.llm_analysis || {
    duplicate_probability: 0,
    feature_scores: {},
    verdict: false,
    summary: 'No analysis available',
  };

  // Safe access to feature scores with default empty object
  const featureScores = llmAnalysis.feature_scores || {};

  // Transform feature scores with descriptions
  const chartFeatures = Object.entries(featureScores).map(([key, value]) => ({
    name: key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    value: typeof value === 'number' ? value : 0,
    profile1Value: getProfileValueForFeature(
      comparison?.query_profile?.details,
      key,
    ),
    profile2Value: getProfileValueForFeature(
      comparison?.matched_profile?.details,
      key,
    ),
    description: getFeatureDescription(
      key,
      comparison?.query_profile?.details,
      comparison?.matched_profile?.details,
    ),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex space-x-2 mb-2 items-center">
            <h2 className="text-gray-800 text-xl font-semibold">
              Profile Comparison
            </h2>
            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-300">{comparison.label_type}</span>
          </div>
          <div className="flex space-x-2 mb-2">
            <ConfidenceBadge
              probability={comparison.llm_analysis.duplicate_probability}
            />
            <DecisionBadge verdict={comparison.llm_analysis.verdict} />
            {userVerdict && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${userVerdict === 'DUPLICATE'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : userVerdict === 'NOT_DUPLICATE'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}
              >
                {userVerdict === 'DUPLICATE'
                  ? 'Manually Verified: Duplicate'
                  : userVerdict === 'NOT_DUPLICATE'
                    ? 'Manually Verified: Not Duplicate'
                    : 'Manually Verified: Unsure'}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleVerdict('DUPLICATE')}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${userVerdict === 'DUPLICATE'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
              } transition-colors`}
          >
            Duplicate
          </button>
          <button
            onClick={() => handleVerdict('NOT_DUPLICATE')}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${userVerdict === 'NOT_DUPLICATE'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
              } transition-colors`}
          >
            Not Duplicate
          </button>
          <button
            onClick={() => handleVerdict('UNSURE')}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${userVerdict === 'UNSURE'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              } transition-colors`}
          >
            Unsure
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <SummaryBox summary={llmAnalysis.summary} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard
          profile={
            comparison?.query_profile || {
              id: 'N/A',
              details: {} as ProfileDetails,
            }
          }
        />
        <ProfileCard
          profile={
            comparison?.matched_profile || {
              id: 'N/A',
              details: {} as ProfileDetails,
            }
          }
        />
      </div>
      <FeatureDetailsTable features={chartFeatures} />
    </div>
  );
};