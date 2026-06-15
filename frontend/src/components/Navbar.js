import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, WalletCards, X } from 'lucide-react';
import Notifications from './Notifications';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ transparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdvertiser, isPublisher, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveLink = (href) => {
    const [path, hash] = href.split('#');
    const currentHash = location.hash.replace('#', '');

    if (hash) {
      return location.pathname === (path || '/') && currentHash === hash;
    }

    return location.pathname === href;
  };

  const navLinks = (() => {
    if (!isAuthenticated) {
      return [
        { name: 'Network', href: '/#network' },
        { name: 'Formats', href: '/#formats' },
        { name: 'Proof', href: '/#proof' },
        { name: 'Workflow', href: '/#workflow' },
        { name: 'Trust', href: '/#trust' },
        { name: 'Pricing', href: '/#pricing' },
      ];
    }

    if (isAdvertiser) {
      return [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Payments', href: '/payments' },
        { name: 'New Campaign', href: '/campaigns/new' },
      ];
    }

    if (isPublisher) {
      return [
        { name: 'Dashboard', href: '/publisher/dashboard' },
        { name: 'Websites', href: '/publisher/dashboard' },
        { name: 'Earnings', href: '/publisher/earnings' },
        { name: 'Payouts', href: '/payouts' },
      ];
    }

    if (isAdmin) {
      return [
        { name: 'Ad Ops', href: '/admin/ad-ops' },
        { name: 'Approvals', href: '/admin/approvals' },
        { name: 'Fraud', href: '/admin/fraud' },
      ];
    }

    return [];
  })();

  const homePath = isAdmin ? '/admin/ad-ops' : isPublisher ? '/publisher/dashboard' : isAdvertiser ? '/dashboard' : '/';

  return (
    <nav className={`sticky top-0 z-50 border-b border-black/10 ${transparent ? 'bg-[#f7f5ef]/90' : 'bg-white'} backdrop-blur`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={homePath} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#151713] text-sm font-black text-[#f7f5ef]">AA</span>
          <span className="text-lg font-semibold tracking-tight">AfriAds</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition ${
                isActiveLink(link.href) ? 'text-[#151713]' : 'text-[#5d6258] hover:text-[#151713]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate('/login')} className="btn-secondary">Sign in</button>
              <button onClick={() => navigate('/register')} className="btn-primary">Open account</button>
            </>
          ) : (
            <>
              <Notifications />
              {isAdvertiser && (
                <button onClick={() => navigate('/campaigns/new')} className="btn-primary py-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Campaign
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 rounded-md border border-black/10 bg-white px-3 py-2 text-left text-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e7ecdf] font-semibold text-[#2f6f4e]">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                  <span>
                    <span className="block font-semibold text-[#151713]">{user?.first_name || 'User'}</span>
                    <span className="block text-xs capitalize text-[#777c72]">{user?.user_type}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#777c72]" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl">
                    <div className="border-b border-black/10 px-4 py-3">
                      <p className="text-sm font-semibold text-[#151713]">{user?.first_name} {user?.last_name}</p>
                      <p className="mt-1 text-xs text-[#777c72]">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to={homePath} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[#f7f5ef]">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {isAdvertiser && (
                        <Link to="/payments" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[#f7f5ef]">
                          <WalletCards className="h-4 w-4" />
                          Wallet
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to="/admin/ad-ops" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[#f7f5ef]">
                          <ShieldCheck className="h-4 w-4" />
                          Ad Ops
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-md border border-black/10 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#5d6258] hover:bg-[#f7f5ef]"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="mt-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                Sign out
              </button>
            ) : (
              <div className="mt-3 grid gap-2">
                <button onClick={() => navigate('/login')} className="btn-secondary justify-center">Sign in</button>
                <button onClick={() => navigate('/register')} className="btn-primary justify-center">Open account</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
