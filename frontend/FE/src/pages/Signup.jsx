import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  MapPin,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'user',
    yearsofExperience: '',
    shortBio: '',
    worksAt: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.yearsofExperience.trim()) {
      newErrors.yearsofExperience = 'Years of experience is required';
    }

    if (!formData.shortBio.trim()) {
      newErrors.shortBio = 'Short bio is required';
    }

    if (!formData.worksAt.trim()) {
      newErrors.worksAt = 'Workplace is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/backend/v1/signin', formData);
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId); 
      alert('Signup successful!');
      navigate('/pfp'); // Navigate to profile page
    } catch (error) {
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700">
              <Stethoscope className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">TrustBridge</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Join TrustBridge</h2>
          <p className="text-slate-400">Create your healthcare professional account</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'doctor')}
                  className={`p-4 rounded-xl border-2 ${
                    formData.role === 'doctor'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <Stethoscope className="h-6 w-6 mx-auto mb-2" />
                  <span className="font-medium">Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'mr')}
                  className={`p-4 rounded-xl border-2 ${
                    formData.role === 'mr'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <Building className="h-6 w-6 mx-auto mb-2" />
                  <span className="font-medium">Medical Rep</span>
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.username ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-4 py-3`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.firstname ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-4 py-3`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstname && <p className="text-sm text-red-400 mt-1">{errors.firstname}</p>}
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.lastname ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-4 py-3`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastname && <p className="text-sm text-red-400 mt-1">{errors.lastname}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.email ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-4 py-3`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.password ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-10 py-3`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-10 py-3`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="yearsofExperience" className="block text-sm font-medium text-slate-300 mb-2">
                  Years of Experience
                </label>
                <input
                  id="yearsofExperience"
                  type="text"
                  value={formData.yearsofExperience}
                  onChange={(e) => handleInputChange('yearsofExperience', e.target.value)}
                  className={`w-full bg-slate-700 border ${
                    errors.yearsofExperience ? 'border-red-500' : 'border-slate-600'
                  } text-white rounded-xl px-4 py-3`}
                  placeholder="e.g. 5"
                />
                {errors.yearsofExperience && <p className="text-sm text-red-400 mt-1">{errors.yearsofExperience}</p>}
              </div>

              <div>
                <label htmlFor="shortBio" className="block text-sm font-medium text-slate-300 mb-2">
                  Short Bio
                </label>
                <div className="relative">
                  <textarea
                    id="shortBio"
                    value={formData.shortBio}
                    onChange={(e) => handleInputChange('shortBio', e.target.value)}
                    className={`w-full bg-slate-700 border ${
                      errors.shortBio ? 'border-red-500' : 'border-slate-600'
                    } text-white rounded-xl pl-10 pr-4 py-3 resize-none`}
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                </div>
                {errors.shortBio && <p className="text-sm text-red-400 mt-1">{errors.shortBio}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="worksAt" className="block text-sm font-medium text-slate-300 mb-2">
                Workplace
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="worksAt"
                  type="text"
                  value={formData.worksAt}
                  onChange={(e) => handleInputChange('worksAt', e.target.value)}
                  className={`w-full bg-slate-700 border ${
                    errors.worksAt ? 'border-red-500' : 'border-slate-600'
                  } text-white rounded-xl pl-10 pr-4 py-3`}
                  placeholder="Enter your workplace"
                />
              </div>
              {errors.worksAt && <p className="text-sm text-red-400 mt-1">{errors.worksAt}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign in here</Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">Secure healthcare communication platform</p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
