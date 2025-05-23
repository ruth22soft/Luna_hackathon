import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CervicalCancerScreening = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    familyHistory: '',
    papSmear: '',
    bleeding: '',
    hpvVaccine: '',
    smoking: '',
    pregnancy: '',
  });

  const steps = [
    { question: 'What is your age?', field: 'age', type: 'number' },
    { question: 'Do you have a family history of cervical cancer?', field: 'familyHistory' },
    { question: 'Have you ever had a Pap smear test?', field: 'papSmear' },
    { question: 'Do you experience unusual vaginal bleeding or discharge?', field: 'bleeding' },
    { question: 'Have you been vaccinated against HPV?', field: 'hpvVaccine' },
    { question: 'Do you smoke?', field: 'smoking' },
    { question: 'Have you been pregnant before?', field: 'pregnancy' },
  ];

  const updateProgress = () => ((currentStep + 1) / steps.length) * 100;

  const handleChange = (e) => {
    setFormData({ ...formData, [steps[currentStep].field]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPrompt = `Analyze this cervical cancer screening data and give a percentage risk score and short analysis:\n\n${Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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', // replace with your actual API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-3.1-24b-instruct:free',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that performs medical screening analysis and calculates risk percentage based on user answers.',
            },
            {
              role: 'user',
              content: formattedPrompt,
            },
          ],
        }),
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || 'Unable to analyze risk.';
      const match = reply.match(/(\d{1,3})\s?%/);
      const percentage = match ? parseInt(match[1]) : 25;

      navigate('/RiskAnalysis', {
        state: { riskPercentage: percentage, analysisText: reply , screeningType : "cervical"},
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong while analyzing your risk. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-300 to-pink-500 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <div className="w-full bg-gray-200 h-2 rounded-lg mb-4">
          <div className="h-2 bg-pink-700" style={{ width: `${updateProgress()}%` }}></div>
        </div>

        {loading ? (
          <p className="text-pink-700 text-lg font-medium">Analyzing your responses...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-lg font-semibold mb-2">
              {steps[currentStep].question}
            </label>

            {steps[currentStep].type === 'number' ? (
              <input
                type="number"
                name={steps[currentStep].field}
                className="w-full border p-4 rounded-xl mb-4"
                value={formData[steps[currentStep].field]}
                onChange={handleChange}
                required
              />
            ) : (
              <select
                name={steps[currentStep].field}
                className="w-full border p-4 rounded-xl mb-4"
                value={formData[steps[currentStep].field]}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            )}

            <div className="flex justify-between mt-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={!formData[steps[currentStep].field]}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-pink-700 text-white px-4 py-2 rounded-md"
                  disabled={!formData[steps[currentStep].field]}
                >
                  Analyze Risk
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CervicalCancerScreening;
