import { useState, useEffect } from 'react';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { ComparisonData } from '@/ts/types/comparison';
import { loadComparisonData } from '@/utils/dataLoader';
import { ComparisonResultCard } from '@/components/comparison-result-card';

// Constants
const STATUS_OPTIONS = {
  ALL: 'All',
  FALSE_POSITIVE: 'False Positives',
  FALSE_NEGATIVE: 'False Negatives',
};

// Main Home component
const Home = () => {
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS.ALL);
  const [itemsPerPage] = useState(1); // Changed from 10 to 1 for single profile view

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await loadComparisonData();
        const transformedData: ComparisonData[] = rawData.map((item: any) => ({
          query_profile: {
            id: item.query_id || 'unknown',
            details: {
              icims_id: item.query_icims_id || '',
              full_name: `${item.query_first_name || ''} ${item.query_last_name || ''}`.trim(),
              first_name: item.query_first_name || '',
              last_name: item.query_last_name || '',
              email: item.query_email || '',
              skills: item.query_skills || '',
              work_experience_details: item.query_work_experience_details || '',
              education_details: item.query_education_details || '',
              latest_work_experience_detail: item.query_latest_work_experience_detail || '',
              latest_education_detail: item.query_latest_education_detail || '',
              job_name: item.query_job_name || '',
            }
          },
          matched_profile: {
            id: item.matched_id || 'unknown',
            details: {
              icims_id: item.matched_icims_id || '',
              full_name: `${item.matched_first_name || ''} ${item.matched_last_name || ''}`.trim(),
              first_name: item.matched_first_name || '',
              last_name: item.matched_last_name || '',
              email: item.matched_email || '',
              skills: item.matched_skills || '',
              work_experience_details: item.matched_work_experience_details || '',
              education_details: item.matched_education_details || '',
              latest_work_experience_detail: item.matched_latest_work_experience_detail || '',
              latest_education_detail: item.matched_latest_education_detail || '',
              job_name: item.matched_job_name || '',
            }
          },
          llm_analysis: {
            duplicate_probability: item.duplicate_probability || 0,
            feature_scores: typeof item.feature_scores === 'string'
              ? JSON.parse(item.feature_scores)
              : (item.feature_scores || {}),
            verdict: item.verdict || false,
            summary: item.summary || 'No analysis available'
          },
          label_type: item.label_type || '',
          ground_truth_label: item.ground_truth_label || 0,
          error_type: item.error_type || ''
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

  const filteredComparisons = comparisons.filter((comparison) => {
    const matchesSearch =
      searchQuery.toLowerCase() === '' ||
      comparison.query_profile.details?.full_name || ''
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.matched_profile.details?.full_name || ''
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.query_profile.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comparison.matched_profile.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const isFP =
      comparison.ground_truth_label === 1 &&
      comparison.llm_analysis.verdict === false;
    const isFN =
      comparison.ground_truth_label === 0 &&
      comparison.llm_analysis.verdict === true;

    const matchesStatus =
      selectedStatus === STATUS_OPTIONS.ALL ||
      (selectedStatus === STATUS_OPTIONS.FALSE_POSITIVE && isFP) ||
      (selectedStatus === STATUS_OPTIONS.FALSE_NEGATIVE && isFN);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredComparisons.length / itemsPerPage);
  const paginatedComparisons = filteredComparisons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">TwinSage</h1>
        <div className="text-sm text-gray-500">
          Profile {currentPage} of {totalPages} ({filteredComparisons.length} total)
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
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
        <div className="flex flex-wrap gap-2">
          {Object.values(STATUS_OPTIONS).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredComparisons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No matching results found</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus(STATUS_OPTIONS.ALL);
            }}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedComparisons.map((comparison) => (
              <ComparisonResultCard
                key={`${comparison.query_profile.id}-${comparison.matched_profile.id}`}
                comparison={comparison}
              />
            ))}
          </div>

          {totalPages > 0 && (
            <div className="flex justify-between items-center mt-6 px-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Previous Profile
              </button>

              <div className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Profile {currentPage} of {totalPages}
                </span>
                <button onClick={() => setCurrentPage(Math.floor(Math.random() * totalPages))}>
                  Random Profile
                </button>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Next Profile
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
