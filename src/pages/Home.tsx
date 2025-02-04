import React, { useState } from 'react';
import { Upload, FileText, LogOut } from 'lucide-react';
import { ref, uploadBytes } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';

export function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !jobDescription) {
      alert('Please upload a resume and enter a job description');
      return;
    }

    try {
      setIsUploading(true);
      setScore(null);

      // Create a reference to the file in Firebase Storage
      const fileRef = ref(storage, `resumes/${currentUser?.uid}/${Date.now()}-${file.name}`);
      
      // Upload the file
      await uploadBytes(fileRef, file);
      
      // Get the file path
      const filePath = fileRef.fullPath;

      // Initialize Firebase Functions
      const functions = getFunctions();
      const analyzeResume = httpsCallable(functions, 'analyzeResume');

      // Call the Cloud Function with the file path
      const result = await analyzeResume({
        filePath,
        jobDescription
      });

      // Update UI with score
      setScore((result.data as any).score);
      setIsModalOpen(true);
      
      // Reset form
      setJobDescription('');
      setFileName('');
      setFile(null);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please make sure your file is a valid PDF and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ATS Score Checker</h1>
            <p className="text-gray-600">Compare your resume against job descriptions</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Resume Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Resume
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600">
                  {fileName ? fileName : 'Click to upload or drag and drop'}
                </span>
                <span className="text-sm text-gray-500">
                  PDF files only
                </span>
              </label>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
              isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}
          </button>
        </form>

        {/* Score Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ATS Score Result</h3>
            {score !== null && (
              <div className="text-center">
                <div className="text-7xl font-bold text-blue-600 mb-4">
                  {score.toFixed(1)}/10
                </div>
                <p className="text-gray-600">
                  {score >= 7
                    ? 'Excellent match! Your resume is well-aligned with the job description.'
                    : score >= 5
                    ? 'Good match. Consider making some improvements to better align with the job requirements.'
                    : 'Your resume might need significant updates to better match this job description.'}
                </p>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}