import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/use-theme';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
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

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Projects', id: 'projects' },
    { label: 'Social', id: 'social' },
    { label: 'Stats', id: 'stats' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-10 xl:px-14">
      <div className="relative mx-auto w-full">
        <div className="surface-card mx-auto flex w-full items-center justify-between gap-6 px-5 py-4 sm:px-6">
          <div>
            <span className="font-jp text-2xl font-bold gradient-text sm:text-3xl">Megitsune</span>
          </div>

          <ul className="hidden list-none items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-foreground/85 transition hover:bg-[color-mix(in_oklch,var(--primary)_16%,transparent)] hover:text-foreground"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-full border border-theme bg-card text-foreground md:inline-flex"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0-1.21 4.79 1.79 7.79S21 12.79 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            ref={hamburgerRef}
            type="button"
            className="focus-ring flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-theme bg-card text-foreground md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Absolute + max-h-0 when closed: no layout ghost; blur only when open avoids compositor glitches */}
        <div
          id="mobile-nav-menu"
          ref={mobileMenuRef}
          aria-hidden={!isMenuOpen}
          className={`absolute left-0 right-0 top-full z-60 mt-3 overflow-hidden rounded-3xl border bg-card/95 shadow-(--shadow-popover) transition-[max-height,opacity,transform,backdrop-filter,border-color,box-shadow] duration-200 ease-out md:hidden ${
            isMenuOpen
              ? 'pointer-events-auto max-h-[min(24rem,85vh)] translate-y-0 border-theme opacity-100 backdrop-blur-md'
              : 'pointer-events-none max-h-0 -translate-y-1 border-transparent opacity-0 shadow-none backdrop-blur-none'
          }`}
        >
          <ul className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="focus-ring w-full rounded-2xl px-4 py-3 text-left text-base font-semibold text-foreground/90 transition hover:bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] hover:text-foreground"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
