const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Showcase your skills, experience and what you're looking for.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    description:
      "Explore jobs or discover talented candidates through a simple interface.",
  },
  {
    number: "03",
    title: "Match & connect",
    description:
      "When interest is mutual, connect and start a conversation.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafaff] text-[#17172b]">

      {/* NAVBAR */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-3xl font-black tracking-tight">
          upcruit<span className="text-violet-600">.</span>
        </h1>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="#how-it-works" className="hover:text-violet-600">
            How it works
          </a>
          <a href="#features" className="hover:text-violet-600">
            Features
          </a>
          <a href="#about" className="hover:text-violet-600">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden text-sm font-semibold md:block"
          >
            Log in
          </a>

          <a
            href="/register"
            className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Get started →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:py-32">

        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-600"></span>
            A new way to discover opportunities
          </div>

          <h2 className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            The right match
            <br />
            changes <span className="text-violet-600">everything.</span>
          </h2>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-500">
            Forget endless applications and endless searching.
            Discover opportunities, connect with talent and
            let the right matches happen.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/register?role=candidate"
              className="rounded-full bg-violet-600 px-7 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              Find opportunities →
            </a>

            <a
              href="/register?role=recruiter"
              className="rounded-full border border-gray-200 bg-white px-7 py-4 font-semibold transition hover:border-violet-300 hover:text-violet-600"
            >
              Find talent
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Built for candidates. Designed for recruiters.
          </p>
        </div>

        {/* HERO VISUAL */}
        <div className="relative mx-auto w-full max-w-md">

          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-200 opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-200 opacity-50 blur-3xl"></div>

          <div className="relative rounded-[2rem] border border-white bg-white p-6 shadow-2xl shadow-violet-100">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Discover talent</p>
                <h3 className="text-xl font-bold">Your next match</h3>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                ● Active
              </span>
            </div>

            <div className="mt-7 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-8 text-center">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl shadow-md">
                👨🏻‍💻
              </div>

              <h4 className="mt-5 text-2xl font-bold">Alex Morgan</h4>
              <p className="mt-1 text-sm text-gray-500">
                Full Stack Developer
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["React", "Node.js", "TypeScript"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-white px-3 py-2 text-xs font-medium text-violet-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex justify-center gap-5">
                <button className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-400 shadow-sm">
                  ✕
                </button>

                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg shadow-violet-200">
                  ♥
                </button>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              Discover. Connect. Grow.
            </p>
          </div>

          <div className="absolute -bottom-7 -right-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
            <p className="text-xs text-gray-400">It's a match!</p>
            <p className="mt-1 font-bold text-violet-600">
              ✨ Mutual interest
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold uppercase tracking-widest text-violet-600">
              Simple by design
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Three steps. One great connection.
            </h2>

            <p className="mt-5 leading-7 text-gray-500">
              Recruitment doesn't have to be complicated.
              We make discovering the right people simpler.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-gray-100 bg-[#fafaff] p-8 transition hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-100"
              >
                <p className="text-4xl font-black text-violet-200">
                  {step.number}
                </p>

                <h3 className="mt-7 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#17172b] px-8 py-16 text-center text-white md:px-20">

          <p className="font-semibold uppercase tracking-widest text-violet-300">
            The future of recruitment
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black md:text-6xl">
            Less searching. More meaningful connections.
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-8 text-gray-400">
            Discover opportunities, express interest and
            connect when both sides see potential.
          </p>

          <a
            href="/register"
            className="mt-9 inline-block rounded-full bg-violet-600 px-8 py-4 font-semibold transition hover:bg-violet-500"
          >
            Join Upcruit →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">

          <h2 className="text-2xl font-black">
            upcruit<span className="text-violet-600">.</span>
          </h2>

          <p className="text-sm text-gray-400">
            Where talent meets opportunity.
          </p>

          <p className="text-sm text-gray-400">
            © 2026 Upcruit. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  );
}