const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full px-4 pb-8 pt-4 sm:px-6 lg:px-10 xl:px-14">
      <div className="surface-card w-full px-6 py-6 text-center shadow-(--shadow-footer)">
        <p className="text-sm text-muted sm:text-base">&copy; {currentYear} Megitsune. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
