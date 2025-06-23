import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Users, MessageSquare, Shield, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '../Component/Navbar';

const LandingPage = () => {
  const nav = useNavigate();
  const features = [
    {
      icon: MessageSquare,
      title: 'Secure Messaging',
      description: 'HIPAA-compliant communication platform for healthcare professionals'
    },
    {
      icon: Users,
      title: 'Professional Network',
      description: 'Connect with doctors, medical representatives, and healthcare experts'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'End-to-end encryption ensures your conversations remain confidential'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Stay connected with your professional network anytime, anywhere'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Cardiologist',
      content: 'TrustBridge has revolutionized how I communicate with my colleagues. The secure platform gives me confidence in sharing sensitive information.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Medical Representative',
      content: 'The interface is intuitive and professional. It has streamlined my communication with healthcare providers significantly.',
      rating: 5
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Emergency Medicine',
      content: 'Fast, secure, and reliable. Exactly what we need in the medical field for professional communication.',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (token) {
      nav('/pfp');
    } else {
      nav('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222.2_84%_4.9%)]">
      
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700">
                <Stethoscope className="h-10 w-10 text-cyan-400" />
                <span className="text-3xl font-bold text-white">TrustBridge</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Secure Communication for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Healthcare Professionals
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect, collaborate, and communicate with confidence. The professional messaging platform 
              designed specifically for doctors and medical representatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button

                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button 
              onClick={()=>nav("/login")}
              className="border-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-slate-800/50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Healthcare Professionals
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Every feature designed with medical communication standards and security in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl w-fit mb-6 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <Icon className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-slate-400">
              See what medical professionals are saying about TrustBridge
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-cyan-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Professional Communication?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust MedConnect for secure, 
            professional communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
          <div className="mt-12">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-6 rounded-xl font-semibold text-xl hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span>Start Connecting Today</span>
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Stethoscope className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">MedConnect</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 MedConnect. All rights reserved.</p>
              <p className="text-sm mt-1">Secure healthcare communication platform</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
