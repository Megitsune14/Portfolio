import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMenu();
  };

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && 
          hamburgerRef.current && 
          mobileMenuRef.current &&
          !hamburgerRef.current.contains(target) && 
          !mobileMenuRef.current.contains(target)) {
        closeMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 w-full bg-dark/95 backdrop-blur-xl z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-8 flex justify-between items-center h-20">
        <div className="nav-logo">
          <span className="text-3xl font-bold gradient-text">Megitsune</span>
        </div>
        
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''} hidden md:flex list-none gap-8`}>
          <li>
            <button 
              onClick={() => scrollToSection('home')}
              className="text-light font-medium transition-all duration-300 hover:text-jinx relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('projects')}
              className="text-light font-medium transition-all duration-300 hover:text-jinx relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Projects
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('social')}
              className="text-light font-medium transition-all duration-300 hover:text-jinx relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Social
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('stats')}
              className="text-light font-medium transition-all duration-300 hover:text-jinx relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Stats
            </button>
          </li>
        </ul>
        
        <div 
          ref={hamburgerRef}
          className="md:hidden cursor-pointer z-50 w-8 h-8 flex items-center justify-center"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden fixed left-0 top-20 w-full bg-darker/95 backdrop-blur-xl z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <ul className="flex flex-col items-center py-8 space-y-6">
          <li>
            <button 
              onClick={() => scrollToSection('home')}
              className="text-light font-medium text-lg transition-all duration-300 hover:text-jinx"
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('projects')}
              className="text-light font-medium text-lg transition-all duration-300 hover:text-jinx"
            >
              Projects
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('social')}
              className="text-light font-medium text-lg transition-all duration-300 hover:text-jinx"
            >
              Social
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollToSection('stats')}
              className="text-light font-medium text-lg transition-all duration-300 hover:text-jinx"
            >
              Stats
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
