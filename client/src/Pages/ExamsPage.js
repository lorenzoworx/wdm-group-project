import React, { useEffect, useState } from "react";
import { getUserData } from '../utilis/auth';

const initialNewExam = {
  title: "",
  description: "",
  duration: "",
  startTime: "",
  endTime: "",
  questions: []
};

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newExam, setNewExam] = useState(initialNewExam);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examResults, setExamResults] = useState({});

  useEffect(() => {
    loadExams();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const user = getUserData();
    setUserData(user);
  };

  const loadExams = () => {
    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    setExams(savedExams);
    
    // Load exam results for students
    if (userData?.userType === 'student') {
      const results = JSON.parse(localStorage.getItem('examResults') || '{}');
      setExamResults(results);
    }
  };

  const handleCreateExam = (e) => {
    e.preventDefault();
    const examToAdd = {
      ...newExam,
      id: Date.now(),
      createdBy: userData.email,
      createdAt: new Date().toISOString()
    };

    const updatedExams = [...exams, examToAdd];
    setExams(updatedExams);
    localStorage.setItem('exams', JSON.stringify(updatedExams));
    setNewExam(initialNewExam);
    setShowCreateModal(false);
  };

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExamModal(true);
  };

  const handleSubmitExam = () => {
    if (selectedExam) {
      const score = calculateScore(selectedExam, answers);
      const result = {
        examId: selectedExam.id,
        score: score,
        totalQuestions: selectedExam.questions.length,
        percentage: Math.round((score / selectedExam.questions.length) * 100),
        submittedAt: new Date().toISOString()
      };

      const newResults = { ...examResults, [selectedExam.id]: result };
      setExamResults(newResults);
      localStorage.setItem('examResults', JSON.stringify(newResults));
      
      setShowExamModal(false);
      alert(`Exam submitted! Your score: ${score}/${selectedExam.questions.length} (${result.percentage}%)`);
    }
  };

  const calculateScore = (exam, userAnswers) => {
    let score = 0;
    exam.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      const diff = startTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { status: 'upcoming', message: `Starts in ${hours}h ${minutes}m` };
    } else if (now > endTime) {
      return { status: 'finished', message: 'Exam finished' };
    } else {
      return { status: 'active', message: 'Exam is live' };
    }
  };

  const filteredExams = exams.filter(exam => {
    // For students, only show exams from their enrolled instructors
    if (userData?.userType === 'student') {
      // This would be filtered by enrolled instructors in a real system
      return true;
    }
    // For instructors/admins, show all exams
    return true;
  });

  const canCreateExam = userData?.userType === 'admin' || userData?.userType === 'instructor' || userData?.userType === 'qa';
  const isStudent = userData?.userType === 'student';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Exams</h1>
          <p className="text-gray-600 mt-1">
            {isStudent ? 'Take exams and view results' : 'Create and manage exams'}
          </p>
        </div>

        {/* Create Exam Button */}
        {canCreateExam && (
          <div className="mb-6">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Exam
            </button>
          </div>
        )}

        {/* Exams List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            const result = examResults[exam.id];
            
            return (
              <div key={exam.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{exam.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status.status === 'active' ? 'bg-green-100 text-green-700' :
                        status.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{exam.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Duration: {exam.duration} minutes</span>
                      <span>Start: {new Date(exam.startTime).toLocaleString()}</span>
                      <span>End: {new Date(exam.endTime).toLocaleString()}</span>
                      {result && (
                        <span className="text-green-600 font-medium">
                          Score: {result.score}/{result.totalQuestions} ({result.percentage}%)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{status.message}</p>
                  </div>
                  <div className="ml-4">
                    {isStudent ? (
                      <div className="flex gap-2">
                        {status.status === 'active' && !result && (
                          <button
                            onClick={() => handleStartExam(exam)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Take Exam
                          </button>
                        )}
                        {result && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            Completed
                          </span>
                        )}
                        {status.status === 'upcoming' && (
                          <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                            Not Started
                          </span>
                        )}
                        {status.status === 'finished' && !result && (
                          <span className="px-4 py-2 bg-red-100 text-red-600 rounded-lg">
                            Expired
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No exams available.
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create New Exam</h3>
            <form onSubmit={handleCreateExam}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title
                  </label>
                  <input
                    required
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter exam description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      required
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={newExam.startTime}
                      onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={newExam.endTime}
                    onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Take Exam Modal */}
      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedExam.title}</h3>
              <button
                onClick={() => setShowExamModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {selectedExam.questions.length > 0 ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {selectedExam.questions.length}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((currentQuestion + 1) / selectedExam.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">
                    {selectedExam.questions[currentQuestion].question}
                  </h4>
                  <div className="space-y-2">
                    {selectedExam.questions[currentQuestion].options.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={`question_${currentQuestion}`}
                          value={index}
                          checked={answers[currentQuestion] === index}
                          onChange={(e) => setAnswers({ ...answers, [currentQuestion]: parseInt(e.target.value) })}
                          className="mr-3"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion === selectedExam.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(Math.min(selectedExam.questions.length - 1, currentQuestion + 1))}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions available for this exam.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
