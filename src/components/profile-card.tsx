import { Profile } from "@/ts/types/comparison";

interface ProfileCardProps {
    profile: Profile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
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
                        {truncateText(details.work_experience_details || '')}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 w-24">Education:</span>
                    <span className="text-gray-800 mt-1">
                        {truncateText(details.education_details || '')}
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