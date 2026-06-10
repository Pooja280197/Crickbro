import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, Layers3, Sparkles, Trophy, Users } from "lucide-react";
import bg_1 from "../assets/Images/bg_1.jpg";
import AboutUsImageLight from "../assets/Images/AboutUsImageLight.png";
import AboutUsImageDark from "../assets/Images/AboutUsImageDark.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import leader1 from "../assets/Members/Deepak Nagar.png";
import leader2 from "../assets/Members/Shubham Agrawal.jpeg";
import HOD1 from "../assets/Members/Naman Jain.jpeg";
import HOD2 from "../assets/Members/Suresh Mehta.png";
import HOD3 from "../assets/Members/Harshit Choudhary.jpeg";
import HOD4 from "../assets/Members/Anurag Nankani.png";
import HOD5 from "../assets/Members/pritam nagar.png";
import HOD6 from "../assets/Members/Shubham Parmar.jpeg";
import HOD7 from "../assets/Members/Tejpratap.jpeg";
import HOD8 from "../assets/Members/vaishnavi shukla.jpeg";
import Team1 from "../assets/Members/Pooja Parmar.png";
import Team2 from "../assets/Members/Devendra Parmar.jpeg";
import Team3 from "../assets/Members/Ashutosh Namdev.jpeg";
import Team4 from "../assets/Members/Aryan Bawankar.jpeg";
import Team5 from "../assets/Members/Utkarsh Singh.jpeg";
import Team6 from "../assets/Members/Kshitij Malviya.jpeg";
import Team7 from "../assets/Members/Monika Nagkani.jpeg";
import Team8 from "../assets/Members/Nirmal Kumawat.jpeg";
import Team9 from "../assets/Members/Yogesh Salame.jpeg";
import Team10 from "../assets/Members/Ashwin.png";
import Team11 from "../assets/Members/Khushi.jpeg";

const leaders = [
  {
    name: "Deepak Nagar",
    role: "Founder",
    desc: "Driving strategy and execution at CrickBro, Deepak focuses on building solutions that solve real problems for organizers and players. His hands-on approach keeps every feature grounded in impact.",
    image: leader1,
  },
  {
    name: "Shubham Agrawal",
    role: "Founder",
    desc: "Leading the technology vision, Shubham is passionate about scalable, seamless digital experiences. His work blends innovation with simplicity so users can move fast with confidence.",
    image: leader2,
  },
];

const hods = [
  {
    name: "Naman Jain",
    image: HOD1,
    role: "Chief Technology Officer",
    bio: "Architects scalable systems for real-time auctions, live scoring, and reliable platform performance.",
    tags: ["Backend", "Infrastructure", "Real-time"],
  },
  {
    name: "Suresh Mehta",
    image: HOD2,
    role: "Head of Technology",
    bio: "Drives technical execution and bridges product ideas with stable, maintainable implementation.",
    tags: ["Development", "Architecture", "Execution"],
  },
  {
    name: "Anurag Nankani",
    image: HOD4,
    role: "Head of Operations",
    bio: "Oversees tournament logistics and keeps large-scale event planning smooth from start to finish.",
    tags: ["Logistics", "Planning", "Execution"],
  },
  {
    name: "Harshit Choudhary",
    image: HOD3,
    role: "Head of Operations",
    bio: "Manages tournament workflows, coordination, and day-to-day execution across events.",
    tags: ["Operations", "Coordination", "Execution"],
  },
  {
    name: "Pritam Nagar",
    image: HOD5,
    role: "Head of Operations",
    bio: "Improves internal processes and team coordination to deliver seamless tournament experiences.",
    tags: ["Operations", "Process", "Delivery"],
  },
  {
    name: "Tej Pratap",
    image: HOD7,
    role: "Head of Sales & Marketing",
    bio: "Expands market presence and builds long-term relationships with clients and partners.",
    tags: ["Sales", "Strategy", "Outreach"],
  },
  {
    name: "Shubham Parmar",
    image: HOD6,
    role: "Head of Sales & Marketing",
    bio: "Focuses on customer acquisition, brand visibility, and strategic partnerships for growth.",
    tags: ["Marketing", "Sales", "Growth"],
  },
  {
    name: "Vaishnavi Shukla",
    image: HOD8,
    role: "HR & Operations Manager",
    bio: "Supports people, culture, and internal workflows so the team can do its best work.",
    tags: ["HR", "Operations", "People"],
  },
];

const team = [
  { name: "Pooja Parmar", image: Team1, profile: "Engineering Team" },
  { name: "Devendra Parmar", image: Team2, profile: "Engineering Team" },
  { name: "Ashutosh Namdev", image: Team3, profile: "Engineering Team" },
  { name: "Aryan Bawankar", image: Team4, profile: "Engineering Team" },
  { name: "Utkarsh Singh", image: Team5, profile: "Engineering Team" },
  { name: "Kshitij Malviya", image: Team6, profile: "Engineering Team" },
  { name: "Monika Nagkani", image: Team7, profile: "Brand Creatives" },
  { name: "Nirmal Kumawat", image: Team8, profile: "Brand Creatives" },
  { name: "Yogesh Salame", image: Team9, profile: "Brand Creatives" },
  { name: "Ashwin", image: Team10, profile: "Brand and Media" },
  { name: "Khushi", image: Team11, profile: "Brand and Media" },
];

const stats = [
  { label: "Auction-first tools", value: "Live", icon: Trophy },
  { label: "Tournament workflows", value: "All-in-one", icon: Layers3 },
  { label: "Organizer support", value: "Built-in", icon: Users },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const sectionLabelClass =
  "inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]";
const panelClass =
  "rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";

function SectionHeader({ eyebrow, title, children }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <span className={sectionLabelClass}>
        <Sparkles size={14} />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-heading text-3xl font-black leading-tight text-[var(--text-primary)] md:text-4xl">
        {title}
      </h2>
      {children && (
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--text-secondary)] md:text-base">
          {children}
        </p>
      )}
    </motion.div>
  );
}

export default function AboutUs({ theme, onToggleTheme }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    restDelta: 0.001,
  });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <motion.div
        className="fixed left-0 top-0 z-[70] h-1 origin-left bg-[var(--secondary)]"
        style={{ scaleX: smoothProgress, width: "100%" }}
        aria-hidden="true"
      />
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border-card)]">
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 opacity-20"
            aria-hidden="true"
          >
            <img src={bg_1} alt="" className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-[var(--bg-main)]/82" aria-hidden="true" />

          <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <motion.span variants={fadeUp} className={sectionLabelClass}>
                <BadgeCheck size={14} />
                About CrickBro
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="mt-5 font-heading text-4xl font-black leading-[1.05] text-[var(--text-primary)] md:text-6xl"
              >
                We build cricket operations that feel{" "}
                <motion.span
                  className="inline-block text-[var(--primary)]"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  simple
                </motion.span>
                , fast, and fair.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-2xl text-base font-medium leading-7 text-[var(--text-secondary)] md:text-lg"
              >
                CrickBro helps organizers run auctions, registrations, trials, teams, and tournament operations from one connected platform.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 280, damping: 18 }}
                      className={`${panelClass} p-4`}
                    >
                      <motion.div
                        whileHover={{ rotate: -6 }}
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                      >
                        <Icon size={18} />
                      </motion.div>
                      <p className="text-lg font-black text-[var(--text-primary)]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className={`${panelClass} relative overflow-hidden p-3`}
            >
              <img
                src={theme === "dark" ? AboutUsImageDark : AboutUsImageLight}
                alt="Cricket team environment"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              {/* <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)]/92 p-4 shadow-[var(--shadow-card)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                  Built for match day
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  Clear workflows for organizers, selectors, owners, and players.
                </p>
              </div> */}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Founders" title="Leadership with product taste and field reality">
              Our founders combine execution, technology, and a deep understanding of how cricket tournaments actually run.
            </SectionHeader>

            <div className="grid gap-5 lg:grid-cols-2">
              {leaders.map((leader, index) => (
                <motion.article
                  key={leader.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  whileHover={{ y: -6 }}
                  className={`${panelClass} overflow-hidden p-4 transition`}
                >
                  <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                    <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)]">
                      <motion.img
                        src={leader.image}
                        alt={leader.name}
                        className="h-64 w-full object-cover object-top sm:h-full"
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="w-fit rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-bold text-[#102033]">
                        {leader.role}
                      </span>
                      <h3 className="mt-4 text-2xl font-black text-[var(--text-primary)]">
                        {leader.name}
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-6 text-[var(--text-secondary)]">
                        {leader.desc}
                      </p>
                      <motion.div
                        className="mt-5 flex items-center gap-2 text-sm font-bold text-[var(--primary)]"
                        whileHover={{ x: 4 }}
                      >
                        {/* Founder {index + 1} */}
                        {/* <ArrowRight size={16} /> */}
                      </motion.div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border-card)] bg-[var(--bg-soft)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Departments" title="Specialists across product, operations, and growth">
              The team behind CrickBro works across engineering, operations, sales, marketing, and people systems.
            </SectionHeader>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              {hods.map((hod) => (
                <motion.article
                  key={hod.name}
                  variants={fadeUp}
                  whileHover={{ y: -6, rotate: -0.35 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`${panelClass} overflow-hidden transition`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[var(--bg-main)]">
                    <motion.img
                      src={hod.image}
                      alt={hod.name}
                      className="h-full w-full object-cover object-top transition duration-500 hover:scale-105"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.45 }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                      {hod.role}
                    </p>
                    <h3 className="mt-2 text-lg font-black text-[var(--text-primary)]">
                      {hod.name}
                    </h3>
                    <p className="mt-2 min-h-[72px] text-sm font-medium leading-6 text-[var(--text-secondary)]">
                      {hod.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hod.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          whileHover={{ y: -2 }}
                          className="rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Team" title="The people turning match-day complexity into clean software">
              Our engineering, creative, and media teams work together to make cricket management feel dependable and modern.
            </SectionHeader>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {team.map((member) => (
                <motion.article
                  key={member.name}
                  variants={fadeUp}
                  whileHover={{ y: -7, scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`${panelClass} p-3 text-center transition`}
                >
                  <div className="mx-auto h-28 w-28 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] sm:h-32 sm:w-32">
                    <motion.img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover object-top"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                  <h4 className="mt-3 truncate text-sm font-black text-[var(--text-primary)]">
                    {member.name}
                  </h4>
                  <p className="mt-1 truncate text-xs font-semibold text-[var(--text-secondary)]">
                    {member.profile}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
