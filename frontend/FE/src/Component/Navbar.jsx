import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Users, MessageCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/pfp', icon: User, label: 'Profile' },
    { to: '/home', icon: Users, label: 'Directory' },
    { to: '/msg', icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1
            className="text-xl font-bold text-foreground cursor-pointer"
            onClick={() => navigate('/home')}
          >
            TrustBridge
          </h1>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* <button className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button> */}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === to
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
