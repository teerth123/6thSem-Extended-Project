import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MapPin, Star, MessageCircle, User, Stethoscope, Building } from 'lucide-react';
import Navbar from '../Component/Navbar';

const DirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await axios.get('http://localhost:3000/backend/v1/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProfessionals(response.data);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    };

    fetchProfessionals();
  }, []);

  const handleSendRequest = async (recipientId) => {
    try {
      await axios.post(
        'http://localhost:3000/backend/v1/connection-requests/send',
        { recipientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Connection request sent successfully!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request.');
    }
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      professional.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || professional.role === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Professional Directory</h1>
            <p className="text-slate-400 text-lg">Connect with healthcare professionals and medical representatives</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                />
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                >
                  <option value="all">All Professionals</option>
                  <option value="doctor">Doctors</option>
                  <option value="mr">Medical Representatives</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                >
                  <option value="all">All Specializations</option>
                  {/* {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))} */}
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-slate-400">
                Showing {filteredProfessionals.length} of {professionals.length} professionals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <div
                key={professional._id}
                className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {professional.username.split(' ').map(n => n[0]).join('')}
                      </div>
                      {professional.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-800"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                        {professional.username}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {professional.role === 'doctor' ? (
                          <Stethoscope className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Building className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-slate-400 text-sm capitalize">
                          {professional.role === 'mr' ? 'Medical Representative' : 'Doctor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    professional.isOnline 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {professional.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-cyan-400 font-semibold">{professional.specialization}</p>
                    <p className="text-slate-300 text-sm">{professional.hospital}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{professional.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{professional.experience}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(professional.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-medium">{professional.rating}</span>
                      <span className="text-slate-400 text-sm">({professional.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSendRequest(professional._id)}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span>Send Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
                <p className="text-slate-400 mb-6">
                  Try adjusting your search criteria or filters to find more results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
