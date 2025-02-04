import React, { useState, useCallback } from 'react';
import { Upload, FileText, LogOut, Rocket, Menu, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { Footer } from '../components/Footer';

export function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setFileName(droppedFile.name);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, []);

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
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-dark-card border-b border-dark-lighter z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-shrink-0">
              <Rocket className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
                Nbula Innovation's RecruitIQ
              </span>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:hidden">
                RecruitIQ
              </span>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-light-muted hover:text-light focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-dark-lighter">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-light-muted hover:text-light flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding-top to account for fixed header */}
      <main className="flex-grow pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-light">
              Resume Analysis
            </h1>
            <p className="text-light-muted mt-2">
              Smart resume analysis for modern job seekers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-dark-card p-6 rounded-lg border border-dark-lighter">
              <h2 className="text-xl font-semibold text-light mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Upload Resume
              </h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  isDragging
                    ? 'border-primary bg-dark-lighter/50'
                    : 'border-dark-lighter hover:border-primary/50'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
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
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-primary animate-bounce' : 'text-primary'}`} />
                  <span className="text-light">
                    {fileName ? fileName : isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-light-muted">
                    PDF files only
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-dark-lighter">
              <h2 className="text-xl font-semibold text-light mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-64 p-4 bg-dark-lighter border border-dark-lighter rounded-lg text-light placeholder-light-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className={`w-full btn-primary ${
                isUploading && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}
            </button>
          </form>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-light mb-4">RecruitIQ Analysis</h3>
              {score !== null && (
                <div className="text-center">
                  <div className="text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                    {score.toFixed(1)}/10
                  </div>
                  <p className="text-light-muted">
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
                className="mt-6 w-full btn-primary"
              >
                Close
              </button>
            </div>
          </Modal>
        </div>
      </main>

      <Footer />
    </div>
  );
}