import React from "react";

const PersonologyReportEmail = () => {
  const reportData = {
    name: "Nupur Sarkar",
    dob: "05/04/2004",
    age: "21",
    risingSign: "Aries Rising",
    gender: "Female",
    location: "Bangalore",
    reportDate: "March 12, 2025",
    planetaryInfluence: [
      {
        planet: "Sun",
        currentInfluence: "Strong",
        effects:
          "You are in a phase of self-discovery and increased confidence.",
        precautions:
          "Continue self-reflection but avoid arrogance. Practice humility.",
        image: "sun_placeholder.png", // Placeholder for Sun image
      },
      {
        planet: "Moon",
        currentInfluence: "Attention",
        effects:
          "Financial stability is present, but impulsive spending may arise.",
        precautions:
          "Stick to a budget and invest wisely. Avoid unnecessary expenses.",
        image: "moon_placeholder.png", // Placeholder for Moon image
      },
      {
        planet: "Mercury",
        currentInfluence: "Strong",
        effects: "Strong family bonds, but some emotional stress lingers.",
        precautions:
          "Spend quality time with loved ones and resolve lingering conflicts.",
        image: "mercury_placeholder.png", // Placeholder for Mercury image
      },
      {
        planet: "Mars",
        currentInfluence: "", // Assuming no specific influence mentioned in the provided text
        effects: "",
        precautions: "",
        image: "mars_placeholder.png", // Placeholder for Mars image
      },
    ],
    keyAttributes: [
      "Strong emotional intelligence",
      "Excellent verbal and non-verbal communication skills",
      "Ability to mediate and resolve conflicts",
    ],
    areasOfExcellence:
      "Your interpersonal skills make you a natural leader and an excellent team player. You thrive in environments that require collaboration and social interaction.",
    growthStrategies: [
      "Engage in active listening and deep conversations",
      "Continue developing networking and relationship-building skills",
      "Take leadership roles in team settings",
    ],
  };

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Personology Report
            </h1>
            <p className="text-sm text-gray-500">{reportData.reportDate}</p>
          </div>
          {/* Placeholder for Logo/Icon */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">X</span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Name:</span> {reportData.name}
          </div>
          <div>
            <span className="font-semibold">DOB:</span> {reportData.dob}
          </div>
          <div>
            <span className="font-semibold">Age:</span> {reportData.age}
          </div>
          <div>
            <span className="font-semibold">Rising Sign:</span>{" "}
            {reportData.risingSign}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {reportData.gender}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {reportData.location}
          </div>
        </div>

        {/* Planetary Influence Report Introduction */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">
            Planetary Influence Report
          </h2>
          <p className="text-sm text-gray-700">
            Your Planetary Influence Report is ready! It outlines how each
            planet impacts different aspects of your life and provides
            actionable steps to harness their energies.
          </p>
        </div>

        {/* Effects of Planets Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Effects of Planets Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {reportData.planetaryInfluence.map((planetInfo, index) => (
              <div key={index} className="rounded-md shadow-sm overflow-hidden">
                <img
                  src={planetInfo.image}
                  alt={planetInfo.planet}
                  className="w-full h-20 object-cover bg-gray-200"
                />
                <div className="p-3 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    {planetInfo.planet}
                  </h4>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Current Influence:</span>{" "}
                    {planetInfo.currentInfluence || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Planets
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Current Influence
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Effects on You
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Precautions & Recommendations
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.planetaryInfluence.map((planetInfo, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-xs text-gray-700">
                      {planetInfo.planet}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-xs text-gray-700">
                      {planetInfo.currentInfluence || "N/A"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-xs text-gray-700">
                      {planetInfo.effects || "N/A"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-xs text-gray-700">
                      {planetInfo.precautions || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Take Aways */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Key Take Aways
          </h3>
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Key Attributes:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {reportData.keyAttributes.map((attribute, index) => (
                <li key={index}>{attribute}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Areas of Excellence:
            </h4>
            <p className="text-sm text-gray-600">
              {reportData.areasOfExcellence}
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Growth Strategies:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {reportData.growthStrategies.map((strategy, index) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonologyReportEmail;
