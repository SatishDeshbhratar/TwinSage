import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FeatureTableProps {
  features: {
    name: string;
    value: number;
    profile1Value: string;
    profile2Value: string;
    description: string;
  }[];
}

export const FeatureDetailsTable: React.FC<FeatureTableProps> = ({ features }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-lg">Feature Details</h2>
        <button
          onClick={toggleExpand}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Hide Details</span>
              <ChevronUp className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              <span>Show Details</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="overflow-hidden rounded-lg border border-gray-200 transition-all duration-300 mt-3">
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
                        className={`inline-block w-16 text-xs ${feature.value >= 0.8
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
                          className={`absolute top-0 left-0 h-full rounded-full ${feature.value >= 0.8
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
      )}
    </div>
  );
};
