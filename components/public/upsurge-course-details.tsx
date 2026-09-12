import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, Check, ChevronRight, Clock, Globe, Star, Users } from "lucide-react";
import courseData from "./upsurge-catalog-data.json";
import styles from "./upsurge-course.module.css";

type CatalogCourse = (typeof courseData)[number];
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const passiveSections = [
  { title: "Introduction", duration: "11 min", topics: ["Meet the instructor", "Course introduction"] },
  { title: "Options fundamentals and return expectations", duration: "49 min", topics: ["Trading mindset", "Options fundamentals", "Comparing option buying and selling"] },
  { title: "The options-selling strategy", duration: "44 min", topics: ["The strategy", "Screening stocks", "Planning entries, exits and stop losses", "Analysis worksheet"] },
  { title: "Putting it together", duration: "27 min", topics: ["Reviewing backtests", "Course wrap-up and community", "Community resource"] },
];

export function UpsurgeCourseDetails({ course, locale }: { course: CatalogCourse; locale: string }) {
  const catalog = `/${locale}/courses`;
  const passive = course.slug === "passive-income-through-options-selling";
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href={`/${locale}`}>Home</Link><ChevronRight size={16} aria-hidden="true" /><Link href={catalog}>Courses</Link><ChevronRight size={16} aria-hidden="true" /><span aria-current="page">{course.title}</span></nav>
    <div className={styles.layout}>
      <div className={styles.main}>
        <header className={styles.heading}>
          <Link className={styles.category} href={`${catalog}?category=${encodeURIComponent(course.categories[0])}`}>{course.categories[0]}</Link>
          <h1>{course.title}</h1>
          <div className={styles.meta}><span><Globe size={18} aria-hidden="true" />{course.language}{passive ? ", Tamil" : ""}</span><span><Star size={18} aria-hidden="true" />{course.rating.toFixed(1)}</span><span><Users size={18} aria-hidden="true" />{course.learners.toLocaleString("en-IN")} learners</span></div>
        </header>
        <Image className={styles.cover} src={course.image} alt={course.title} width={1048} height={590} sizes="(max-width: 800px) 95vw, 65vw" priority />
        <nav className={styles.tabs} aria-label="Course sections"><a href="#about-course">About</a>{passive && <a href="#course-overview">Course Overview</a>}<a href="#course-instructor">Instructor</a></nav>
        {passive && <section className={styles.section}><h2>What You Will Learn</h2><ul className={styles.outcomes}>{["Explore an options-selling approach to income", "Screen stocks for potential trades", "Plan entries, exits and stop losses", "Build a disciplined trading mindset"].map(item => <li key={item}><Check size={21} aria-hidden="true" />{item}</li>)}</ul></section>}
        {passive && <section id="course-overview" className={styles.section}><h2>Your Course Overview</h2><p className={styles.muted}>4 sections � 12 topics � 2 hrs 12 mins</p><div className={styles.curriculum}>{passiveSections.map((section, index) => <details key={section.title} open={index === 0}><summary><span>{index + 1}. {section.title}</span><span>{section.duration}</span></summary><ul>{section.topics.map(topic => <li key={topic}><BookOpen size={17} aria-hidden="true" />{topic}</li>)}</ul></details>)}</div></section>}
        <section id="about-course" className={styles.section}><h2>About The Course</h2><p>{passive ? "Sanjay Kathuria introduces an options-selling strategy, stock screening, trade planning and backtesting. The course includes an analysis worksheet and discusses the mindset involved in options trading." : `Explore ${course.categories[0].toLowerCase()} with ${course.instructor} in ${course.title}.`}</p></section>
        <section id="course-instructor" className={styles.section}><h2>Learn From</h2><div className={styles.instructor}><span aria-hidden="true">{course.instructor.charAt(0)}</span><div><h3>{course.instructor}</h3><p>Course instructor</p></div></div></section>
      </div>
      <aside className={styles.purchase} aria-label="Course information">
        <div className={styles.purchaseInner}>
          <h2>{course.title}</h2>
          <ul className={styles.facts}><li><Users aria-hidden="true" />{course.learners.toLocaleString("en-IN")} Learners Enrolled</li><li><BookOpen aria-hidden="true" /><span className={styles.level}>{course.level} Level</span></li><li><Globe aria-hidden="true" />{course.language}{passive ? ", Tamil" : ""}</li>{passive && <><li><Clock aria-hidden="true" />2 hrs of Content</li><li><Award aria-hidden="true" />Certificate of completion</li></>}</ul>
          <div className={styles.price}><strong>{money.format(course.price)}</strong><del>{money.format(course.originalPrice)}</del><span>SAVE {Math.round((1 - course.price / course.originalPrice) * 100)}%</span></div>
          <p className={styles.availability}>Enrollment for this course is not available yet.</p>
          <Link className={styles.primary} href={`/${locale}/pricing`}>Explore PRO plans</Link>
          <Link className={styles.back} href={catalog}>Browse all courses</Link>
        </div>
      </aside>
    </div>
  </div>;
}
