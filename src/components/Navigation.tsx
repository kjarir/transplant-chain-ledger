import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Heart, Shield, Users, Activity } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home", icon: Heart },
    { href: "/about", label: "About", icon: Shield },
    { href: "/contact", label: "Contact", icon: Heart },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: Activity }] : [])
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TransplantChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="medical" size="sm" asChild>
                  <Link to="/auth">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border mt-4">
                {user ? (
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button variant="medical" size="sm" asChild>
                      <Link to="/auth">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;