import React from "react";
import DocumentIcon from "./assets/document_icon.png"; // Import document icon
import ExclamationIcon from "./assets/exclamation_icon.png"; // Import exclamation icon
import LightbulbIcon from "./assets/lightbulb_icon.png"; // Import lightbulb icon
import UserPlaceholderImage from "./assets/user_placeholder.png"; // Import your placeholder image

const primaryColor = "rgb(37, 99, 235)"; // Tailwind's blue-600
const accentColor = "rgb(191, 219, 254)"; // Tailwind's blue-200

const AssessmentReportTemplate = () => {
  const reportData = {
    name: "[Name]",
    dob: "[Date of Birth]",
    age: "[Age]",
    risingSign: "[Rising Sign]",
    gender: "[Gender]",
    location: "[Location]",
    reportDate: "[Date]",
    intelligenceProfile: {
      type: "[Intelligence Type]",
      description: "[Intelligence Description]",
    },
    emotionalHealthBreakdown: [
      {
        element: "Interpersonal Intelligence",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
      {
        element: "Linguistic Intelligence",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
      {
        element: "Confidence (Sun Position)",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
      {
        element: "Emotional Sensitivity (Moon Position)",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
      {
        element: "Communication Skills (Mercury Influence)",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
      {
        element: "Social Impact",
        status: "[Status]",
        responsibility: "[Responsibility]",
        notes: "[Notes]",
      },
    ],
    recommendations: {
      knownIssues: "[Known Issues]",
      potentialRisks: "[Potential Risks]",
      changeRequest: "[Change Request]",
    },
    keyTakeAways: {
      attributes: ["[Attribute 1]", "[Attribute 2]", "[Attribute 3]"],
      areasOfExcellence: "[Areas of Excellence]",
      growthStrategies: ["[Strategy 1]", "[Strategy 2]", "[Strategy 3]"],
    },
  };

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className="text-xl font-semibold text-gray-800"
              style={{ color: primaryColor }}
            >
              Assessment Report
            </h1>
            <p className="text-xs text-gray-500">{reportData.reportDate}</p>
          </div>
          <div className="relative w-8 h-8 cursor-pointer">
            <div className="absolute top-0 right-0 text-gray-600 hover:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-2 bg-gray-300 flex items-center justify-center">
              <img
                src={UserPlaceholderImage}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold">Name:</div>
              <div>{reportData.name}</div>
            </div>
          </div>
          <div>
            <div className="font-semibold">DOB:</div>
            <div>{reportData.dob}</div>
          </div>
          <div>
            <div className="font-semibold">Age:</div>
            <div>{reportData.age}</div>
          </div>
          <div>
            <div className="font-semibold">Rising Sign:</div>
            <div>{reportData.risingSign}</div>
          </div>
          <div>
            <div className="font-semibold">Gender:</div>
            <div>{reportData.gender}</div>
          </div>
          <div>
            <div className="font-semibold">Location:</div>
            <div>{reportData.location}</div>
          </div>
        </div>

        {/* Your Intelligence Profile */}
        <div
          className="rounded-md p-4 mb-6 border"
          style={{ borderColor: accentColor, backgroundColor: accentColor }}
        >
          <h2 className="text-md font-semibold" style={{ color: primaryColor }}>
            {reportData.intelligenceProfile.type}
          </h2>
          <p className="text-sm text-gray-700">
            {reportData.intelligenceProfile.description}
          </p>
        </div>

        {/* Emotional Health Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Emotional Health Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 text-sm">
              <thead style={{ backgroundColor: accentColor }}>
                <tr>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                    Element
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                    Responsibility
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.emotionalHealthBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 text-gray-700">
                      {item.element}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700">
                      {item.status}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700">
                      {item.responsibility}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-md p-4 border border-gray-100 flex items-start">
            <img
              src={LightbulbIcon}
              alt="Known Issues"
              className="w-6 h-6 mr-2"
              style={{ color: primaryColor }}
            />
            <div>
              <h4 className="font-semibold mb-1">Known issues:</h4>
              <p className="text-xs">
                {reportData.recommendations.knownIssues}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-4 border border-gray-100 flex items-start">
            <img
              src={ExclamationIcon}
              alt="Potential Risks"
              className="w-6 h-6 mr-2"
              style={{ color: primaryColor }}
            />
            <div>
              <h4 className="font-semibold mb-1">Potential risks:</h4>
              <p className="text-xs">
                {reportData.recommendations.potentialRisks}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-4 border border-gray-100 flex items-start">
            <img
              src={DocumentIcon}
              alt="Change Request"
              className="w-6 h-6 mr-2"
              style={{ color: primaryColor }}
            />
            <div>
              <h4 className="font-semibold mb-1">Change request:</h4>
              <p className="text-xs">
                {reportData.recommendations.changeRequest}
              </p>
            </div>
          </div>
        </div>

        {/* Key Take Aways */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Key Take Aways
          </h3>
          <div className="mb-3">
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              Key Attributes:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {reportData.keyTakeAways.attributes.map((attribute, index) => (
                <li key={index}>{attribute}</li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              Areas of Excellence:
            </h4>
            <p className="text-sm text-gray-600">
              {reportData.keyTakeAways.areasOfExcellence}
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              Growth Strategies:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {reportData.keyTakeAways.growthStrategies.map(
                (strategy, index) => (
                  <li key={index}>{strategy}</li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReportTemplate;
