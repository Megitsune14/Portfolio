import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          className={`hamburger md:hidden flex flex-col cursor-pointer ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span className="bar w-6 h-0.5 bg-light my-1 transition-all duration-300"></span>
          <span className="bar w-6 h-0.5 bg-light my-1 transition-all duration-300"></span>
          <span className="bar w-6 h-0.5 bg-light my-1 transition-all duration-300"></span>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden fixed left-0 top-20 w-full bg-darker transition-all duration-300 ${isMenuOpen ? 'left-0' : '-left-full'}`}>
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
