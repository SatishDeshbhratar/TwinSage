

export const ConfidenceBadge = ({ probability }: { probability: number }) => {
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

export const DecisionBadge = ({ verdict }: { verdict: boolean }) => {
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