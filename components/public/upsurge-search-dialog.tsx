"use client";

import { useState } from "react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Search, TrendingUp, ChartColumnIncreasing, CandlestickChart, Layers, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import courseData from "./upsurge-catalog-data.json";
import styles from "./upsurge-search.module.css";
import shell from "./upsurge.module.css";

const topics = ["AI Renko Indicator", "advanced morning tea", "passive income", "renko indicator with targets"];
const categories = [
  { title: "Stock Market Investing", icon: TrendingUp },
  { title: "Option Trading", icon: Layers },
  { title: "Stock Market Basics", icon: ChartColumnIncreasing },
  { title: "Technical Analysis", icon: CandlestickChart },
];

export function UpsurgeSearchDialog({ catalog, fontClassName }: { catalog: string; fontClassName: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const term = query.trim();
  const normalize = (value: string) => value.toLowerCase().replace(/options/g, "option");
  const results = term.length >= 3 ? courseData.filter(course => normalize([course.title, course.instructor, ...course.categories].join(" ")).includes(normalize(term))) : courseData.slice(0, 4);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger className={`${shell.search} ${styles.trigger}`} aria-label="Search courses"><span>Search for &apos;Scalping Trading&apos;</span><span className={styles.searchIcon}><Search aria-hidden="true" /></span></DialogTrigger>
    <DialogPortal>
      <DialogOverlay className={styles.overlay} />
      <Primitive.Popup className={`${styles.modal} ${fontClassName}`}>
        <DialogTitle className="sr-only">Search courses</DialogTitle>
        <DialogDescription className="sr-only">Explore trending topics and categories, or enter at least three characters to search courses.</DialogDescription>
        <div className={styles.topRow}>
          <form role="search" className={styles.searchField} onSubmit={event => { event.preventDefault(); if (term.length >= 3) { setOpen(false); router.push(`${catalog}?search=${encodeURIComponent(term)}`); } }}>
            <label htmlFor="course-search-query" className="sr-only">Search courses</label>
            <input id="course-search-query" type="search" placeholder="Search for courses or instructors" maxLength={150} value={query} onChange={event => setQuery(event.target.value)} />
            {term.length < 3 && <span className={styles.hint}>{3 - term.length} more character{term.length === 2 ? "" : "s"}</span>}
            <button type="submit" disabled={term.length < 3} aria-label="View search results"><Search size={16} aria-hidden="true" /></button>
          </form>
          <DialogClose className={styles.close} aria-label="Close search"><X size={20} aria-hidden="true" /></DialogClose>
        </div>
        {term.length < 3 && <>
          <section><h2>Trending topics</h2><div className={styles.topics}>{topics.map(topic => <Link key={topic} href={`${catalog}?search=${encodeURIComponent(topic)}`} onClick={() => setOpen(false)}><TrendingUp size={18} aria-hidden="true" />{topic}</Link>)}</div></section>
          <section><h2>Top categories</h2><div className={styles.categories}>{categories.map(({ title, icon: Icon }) => <Link key={title} href={`${catalog}?category=${encodeURIComponent(title)}`} onClick={() => setOpen(false)}><Icon size={30} aria-hidden="true" />{title}</Link>)}</div></section>
        </>}
        <section><h2>{term.length >= 3 ? "Search results" : "Trending courses"}</h2>
          <p className="sr-only" role="status">{term.length >= 3 ? `${results.length} matching courses` : "Trending courses"}</p>
          {results.length ? <div className={styles.courses}>{results.map(course => <a key={course.slug} href={`https://www.upsurge.club/course/${course.slug}`} className={styles.course}><h3>{course.title}</h3><p>{course.instructor}</p><Image src={course.image} alt="" width={320} height={180} sizes="(max-width: 600px) 40vw, 210px" /></a>)}</div> : <div className={styles.empty}><p>No courses found for “{term}”.</p><button type="button" onClick={() => setQuery("")}>Explore trending courses</button></div>}
        </section>
      </Primitive.Popup>
    </DialogPortal>
  </Dialog>;
}
