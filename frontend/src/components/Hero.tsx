import profilPicture from '../assets/images/profil_picture.png';

const Hero = () => {
  const getCurrentAge = () => {
    const today = new Date();
    const birthYear = 2002;
    const birthMonth = 11; // December (0-indexed)
    const birthDay = 21;

    let age = today.getFullYear() - birthYear;
    const hasHadBirthdayThisYear =
      today.getMonth() > birthMonth ||
      (today.getMonth() === birthMonth && today.getDate() >= birthDay);

    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    return age;
  };

  const currentAge = getCurrentAge();

  return (
    <section id="home" className="relative w-full overflow-hidden px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[oklch(0.58_0.2_27/0.14)] blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-[oklch(0.56_0.16_303/0.2)] blur-3xl" />
      </div>

      <div className="surface-panel relative z-10 grid min-h-[calc(100vh-11rem)] w-full items-center gap-10 overflow-hidden px-6 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="text-center lg:text-left">
          <h1 className="mb-4 font-jp text-5xl font-bold leading-tight sm:text-6xl xl:text-7xl">
            <span className="gradient-text">Megitsune</span>
          </h1>
          <p className="mb-4 text-xl font-semibold text-(--primary) sm:text-2xl">Developer & Gamer</p>
          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              My username, Megitsune, comes from the Japanese band Babymetal. <br />
              I'm {currentAge} years old and passionate about video games such as League of Legends, Overwatch, and Rocket League. 
              I'm also deeply interested in development and love exploring new ways to create and learn.
          </p>
          </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--chart-3),var(--accent))] opacity-60 blur-2xl" />
            <img
              src={profilPicture}
              alt="Megitsune - Kitsune Mask"
              className="relative h-64 w-64 rounded-full border-4 border-[color-mix(in_oklch,var(--accent)_65%,transparent)] object-cover shadow-(--shadow-panel) transition-transform duration-300 hover:scale-[1.02] sm:h-80 sm:w-80 lg:h-96 lg:w-96"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden>
        <div className="relative h-10 w-0.5 bg-[linear-gradient(to_bottom,var(--primary),transparent)]">
          <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-(--accent)" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
