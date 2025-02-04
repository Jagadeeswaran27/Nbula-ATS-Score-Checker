import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to create an account');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup(e: React.MouseEvent) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      if (error.message === 'Popup was blocked by the browser') {
        setError('Please allow popups for this site to sign up with Google');
      } else {
        setError('Failed to sign up with Google');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UserPlus className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-light bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Join RecruitIQ
          </h2>
          <p className="text-light-muted mt-2">Create your account</p>
        </div>

        {error && (
          <div className="bg-dark-lighter text-secondary p-3 rounded-lg mb-4 border border-secondary/20">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignup}
          type="button"
          disabled={loading}
          className="w-full mb-4 btn-secondary"
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            alt="Google" 
            className="w-5 h-5 inline mr-2"
          />
          Sign up with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-lighter"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark text-light-muted">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-light">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-light">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-light-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}