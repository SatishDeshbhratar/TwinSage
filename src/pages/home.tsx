import { useState, useEffect } from 'react';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { getVerdict, saveVerdict } from './verdictHandler';
import { ComparisonData, Profile, ProfileDetails } from '@/ts/types/comparison';
import { VerdictType } from '@/ts/types/verdict';
import { loadComparisonData } from '@/utils/dataLoader';

// Constants
const STATUS_OPTIONS = {
  ALL: 'All',
  HIGH_CONFIDENCE: 'High-Confidence',
  MEDIUM_CONFIDENCE: 'Medium-Confidence',
  LOW_CONFIDENCE: 'Low-Confidence',
  MANUALLY_DUPLICATE: 'Manually Verified: Duplicate',
  MANUALLY_NOT_DUPLICATE: 'Manually Verified: Not Duplicate',
  MANUALLY_UNSURE: 'Manually Verified: Unsure',
};

const getConfidenceCategory = (probability: number) => {
  if (probability >= 0.95 || probability <= 0.05) {
    return 'High-Confidence';
  } else if (
    (probability >= 0.8 && probability < 0.95) ||
    (probability > 0.05 && probability <= 0.2)
  ) {
    return 'Medium-Confidence';
  } else {
    return 'Low-Confidence';
  }
};

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

const ConfidenceBadge = ({ probability }: { probability: number }) => {
  const category = getConfidenceCategory(probability);

  let colorClass = 'bg-gray-200 text-gray-800'; // default

  if (category === 'High-Confidence') {
    colorClass = 'bg-green-100 text-green-800 border-green-300';
  } else if (category === 'Medium-Confidence') {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  } else if (category === 'Low-Confidence') {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-300';
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {category}
    </span>
  );
};

const DecisionBadge = ({ verdict }: { verdict: boolean }) => {
  return verdict ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
      Duplicate
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
      Not Duplicate
    </span>
  );
};

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const details = profile.details;
  const skills = details.skills?.split(' ').filter((s) => s.length > 1) || [];

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number = 150): string => {
    if (!text) return 'N/A';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Format location
  const location =
    [details.address_city, details.address_state, details.address_country]
      .filter(Boolean)
      .join(', ') || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            {details.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div>
          <h3 className="text-gray-800 font-large text-lg">
            {details.full_name}
          </h3>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex">
          <span className="text-gray-500 w-24">ID:</span>
          <span className="text-gray-800 font-mono">{profile.id || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-24">Email:</span>
          <span className="text-gray-800">{details.email || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-24">Location:</span>
          <span className="text-gray-800">{location}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 w-24">Experience:</span>
          <span className="text-gray-800 mt-1">
            {truncateText(details.work_experience_details)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 w-24">Education:</span>
          <span className="text-gray-800 mt-1">
            {truncateText(details.education_details)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Skills:</span>
          <div className="flex flex-wrap gap-1">
            {skills.length > 0 ? (
              skills.slice(0, 15).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No skills listed</span>
            )}
            {skills.length > 15 && (
              <span className="text-gray-500 text-xs mt-1">
                +{skills.length - 15} more skills
              </span>
            )}
          </div>
        </div>

        {/* Optional: Add social links if available */}
        {(details.linkedIn || details.github_raw) && (
          <div className="flex flex-col mt-2">
            <span className="text-gray-500 w-24">Social:</span>
            <div className="flex gap-2 mt-1">
              {details.linkedIn && (
                <a
                  href={
                    details.linkedIn.startsWith('http')
                      ? details.linkedIn
                      : `https://${details.linkedIn}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {details.github_raw && (
                <a
                  href={
                    details.github_raw.startsWith('http')
                      ? details.github_raw
                      : `https://${details.github_raw}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface FeatureTableProps {
  features: {
    name: string;
    value: number;
    profile1Value: string;
    profile2Value: string;
    description: string;
  }[];
}

const FeatureDetailsTable: React.FC<FeatureTableProps> = ({ features }) => {
  return (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-3">Feature Details</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {feature.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-16 text-xs ${
                        feature.value >= 0.8
                          ? 'text-green-600'
                          : feature.value >= 0.5
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {(feature.value * 100).toFixed(1)}%
                    </span>
                    <div className="relative w-16 h-2 bg-gray-200 rounded-full ml-2">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          feature.value >= 0.8
                            ? 'bg-green-500'
                            : feature.value >= 0.5
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${feature.value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-lg">
                    Profile 1: {feature.profile1Value}
                    <br />
                    Profile 2: {feature.profile2Value}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ComparisonResultCard = ({
  comparison,
}: {
  comparison: ComparisonData;
}) => {
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
          <h2 className="text-gray-800 text-xl font-semibold mb-2">
            Profile Comparison
          </h2>
          <div className="flex space-x-2 mb-2">
            <ConfidenceBadge
              probability={comparison.llm_analysis.duplicate_probability}
            />
            <DecisionBadge verdict={comparison.llm_analysis.verdict} />
            {userVerdict && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  userVerdict === 'DUPLICATE'
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
            className={`px-4 py-2 rounded-md ${
              userVerdict === 'DUPLICATE'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } transition-colors`}
          >
            Duplicate
          </button>
          <button
            onClick={() => handleVerdict('NOT_DUPLICATE')}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${
              userVerdict === 'NOT_DUPLICATE'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } transition-colors`}
          >
            Not Duplicate
          </button>
          <button
            onClick={() => handleVerdict('UNSURE')}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${
              userVerdict === 'UNSURE'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            } transition-colors`}
          >
            Unsure
          </button>
        </div>
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

// Main Home component
const Home = () => {
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS.ALL);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await loadComparisonData();

        // Transform the data to ensure it matches the ComparisonData type
        const transformedData: ComparisonData[] = rawData.map((item: any) => ({
          query_profile: item.query_profile,
          matched_profile: item.matched_profile,
          label_type: item.label_type || '', // Provide default values
          ground_truth_label: item.ground_truth_label || 0, // Provide default values
          llm_analysis: {
            duplicate_probability: item.llm_analysis.duplicate_probability,
            feature_scores: item.llm_analysis.feature_scores,
            verdict: item.llm_analysis.verdict,
            summary: item.llm_analysis.summary,
          },
        }));

        setComparisons(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load comparison data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter comparisons based on search query and selected status
  const filteredComparisons = comparisons.filter((comparison) => {
    const matchesSearch =
      searchQuery.toLowerCase() === '' ||
      comparison.query_profile.details.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.matched_profile.details.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.query_profile.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.matched_profile.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const confidenceCategory = getConfidenceCategory(
      comparison.llm_analysis.duplicate_probability,
    );
    const matchesStatus =
      selectedStatus === STATUS_OPTIONS.ALL ||
      (selectedStatus === STATUS_OPTIONS.HIGH_CONFIDENCE &&
        confidenceCategory === 'High-Confidence') ||
      (selectedStatus === STATUS_OPTIONS.MEDIUM_CONFIDENCE &&
        confidenceCategory === 'Medium-Confidence') ||
      (selectedStatus === STATUS_OPTIONS.LOW_CONFIDENCE &&
        confidenceCategory === 'Low-Confidence');

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 1;
  const totalPages = Math.ceil(filteredComparisons.length / itemsPerPage);
  const paginatedComparisons = filteredComparisons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">TwinSage</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(STATUS_OPTIONS).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              selectedStatus === status
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredComparisons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 text-lg">No results found</p>
        </div>
      ) : (
        <>
          {paginatedComparisons.map((comparison) => (
            <ComparisonResultCard
              key={comparison.query_profile.id + comparison.matched_profile.id}
              comparison={comparison}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
