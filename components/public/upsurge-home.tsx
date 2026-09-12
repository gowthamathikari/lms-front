import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight, ChevronRight, CirclePlay, Clock3, Star } from "lucide-react";
import styles from "./upsurge.module.css";

const courses = [
  { title: "Price Action Strategy using CPR", category: "Technical Analysis", image: 2 },
  { title: "Options Selling Strategies", category: "Options Trading", image: 7 },
  { title: "Strategies for Long-Term Profit", category: "Stock Market Investing", image: 5 },
  { title: "Understanding Renko Charts", category: "Technical Analysis", image: 6 },
];
const imageRows = [[2, 3, 4, 5, 6], [6, 7, 8, 9, 10], [11, 12, 1, 3, 5]];

export async function UpsurgeHome() {
  const locale = await getLocale();
  const catalog = `/${locale}/courses`;
  return (
    <div className={styles.home}>
      <a className={styles.offer} href={catalog}>
        <span aria-hidden="true">🎉</span> Save Upto 60% on Courses! Offer Ends Today!
      </a>
      <section className={styles.hero} aria-labelledby="upsurge-heading">
        <div className={styles.collage} aria-hidden="true">
          {imageRows.map((row, rowIndex) => (
            <div className={styles.imageRow} key={rowIndex}>
              {row.map((image, index) => (
                <Image key={`${image}-${index}`} src={`/upsurge/course-${image}.webp`} alt="" width={426} height={245} sizes="(max-width: 600px) 280px, 426px" loading={rowIndex === 0 ? "eager" : "lazy"} />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.heroContent}>
          <p className={styles.trust}>Trusted by <strong>439,037 traders &amp; investors</strong> <span aria-hidden="true">❤️</span></p>
          <h1 id="upsurge-heading">We make it easy to learn
            <span className={styles.subject}>Crypto Trading</span>
          </h1>
          <p className={styles.subtitle}>from India&apos;s top stock market experts</p>
          <Link href={catalog} className={styles.primary}>Explore Courses <ChevronRight aria-hidden="true" /></Link>
          <div className={styles.heroRule} />
          <dl className={styles.stats}>
            <div><dt><CirclePlay aria-hidden="true" /> Online Courses</dt><dd>300+</dd></div>
            <div><dt><Clock3 aria-hidden="true" /> Content Hours Viewed</dt><dd>500,000+</dd></div>
            <div><dt><Star aria-hidden="true" /> Average Rating</dt><dd>4.8/5</dd></div>
          </dl>
        </div>
      </section>
      <section className={styles.courses} id="courses" aria-labelledby="course-heading">
        <h2 id="course-heading">Stock market courses for everyone</h2>
        <p>Choose from a wide range of stock market courses on trading and investing.</p>
        <div className={styles.sectionHeading}><h3>Trending</h3><Link href={catalog}>View all <ArrowRight aria-hidden="true" /></Link></div>
        <div className={styles.courseGrid}>
          {courses.map((course) => (
            <Link key={course.title} href={`${catalog}?search=${encodeURIComponent(course.title)}`} className={styles.courseCard}>
              <Image src={`/upsurge/course-${course.image}.webp`} alt={course.title} width={426} height={245} sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 23vw" />
              <div className={styles.courseBody}><span>{course.category}</span><h3>{course.title}</h3><p>Explore course <ArrowRight aria-hidden="true" /></p></div>
            </Link>
          ))}
        </div>
        <div className={styles.explore}>
          <div><h2>Explore Upsurge</h2><p>Learn stock market the right way through our courses, webinars and mentorship programs.</p></div>
          <div className={styles.exploreLinks}>
            <Link href={catalog}>All Courses <ArrowRight aria-hidden="true" /></Link>
            <a href="https://www.upsurge.club/webinars">All Webinars <ArrowRight aria-hidden="true" /></a>
            <a href="https://www.upsurge.club/live-mentorships">Mentorship Programs <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}