import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar,
  Edit3, Save, X, Camera
} from 'lucide-react';
import Navbar from '../Component/Navbar';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // ✅ Get userId from here

        const response = await axios.get(`http://localhost:3000/backend/v1/user/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchConnectionRequests = async () => {
      try {
        const response = await axios.get('http://localhost:3000/backend/v1/connection-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setConnectionRequests(response.data);
      } catch (error) {
        console.error('Error fetching connection requests:', error);
      }
    };

    fetchProfile();
    fetchConnectionRequests();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/backend/v1/profile', editedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(
        `http://localhost:3000/backend/v1/connection-requests/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Connection request accepted successfully!');
      setConnectionRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert('Failed to accept connection request.');
    }
  };

  if (!profile) {
    return <div className="text-white text-center">Loading profile...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 mb-8 border border-slate-600">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profile.username.split(' ').map(n => n[0]).join('')}
                    {/* {profile.username} */}
                  </div>
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                  <p className="text-cyan-400 text-lg font-medium">{profile.specialization}</p>
                  <p className="text-slate-300">{profile.hospital}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors duration-300"
              >
                <Edit3 className="h-5 w-5" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <User className="h-6 w-6 text-cyan-400 mr-3" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', field: 'name', type: 'text' },
                    { label: 'Email', field: 'email', type: 'email' },
                    { label: 'Phone', field: 'phone', type: 'tel' },
                    { label: 'Location', field: 'location', type: 'text' }
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
                      {isEditing ? (
                        <input
                          type={type}
                          value={editedProfile[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                        />
                      ) : (
                        <p className="text-white text-lg">{profile[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 text-cyan-400 mr-3" />
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { label: 'Specialization', field: 'specialization' },
                    { label: 'Experience', field: 'experience' },
                    { label: 'Hospital/Clinic', field: 'hospital', fullWidth: true }
                  ].map(({ label, field, fullWidth }) => (
                    <div key={field} className={fullWidth ? 'md:col-span-2' : ''}>
                      <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                        />
                      ) : (
                        <p className="text-white text-lg">{profile[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300 resize-none"
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Info */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    <span className="text-slate-300">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-cyan-400" />
                    <span className="text-slate-300">{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <span className="text-slate-300">{profile.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <span className="text-slate-300">{profile.experience} experience</span>
                  </div>
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Education & Certifications</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Education', field: 'education', rows: 2 },
                    { label: 'Certifications', field: 'certifications', rows: 3 }
                  ].map(({ label, field, rows }) => (
                    <div key={field}>
                      <label className="block text-slate-400 text-sm font-medium mb-2">{label}</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          rows={rows}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300 resize-none"
                        />
                      ) : (
                        <p className="text-slate-300">{profile[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Connection Requests */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Connection Requests</h2>

            {connectionRequests.length > 0 ? (
              <ul className="space-y-4">
                {connectionRequests.map((request) => (
                  <li
                    key={request._id}
                    className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">{request.username}</p>
                      <p className="text-slate-400 text-sm">{request.email}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No pending connection requests.</p>
            )}
          </div>

          {/* Save / Cancel Buttons */}
          {isEditing && (
            <div className="fixed bottom-8 right-8 flex space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors duration-300"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors duration-300"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
