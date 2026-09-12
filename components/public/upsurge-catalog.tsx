"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, BookOpen, ChevronDown, ChevronRight, Grid2X2, ListFilter, Search, Star, Users, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import courseData from "./upsurge-catalog-data.json";
import styles from "./upsurge-catalog.module.css";

const categories = ["Stock Market Investing", "Option Trading", "Stock Market Basics", "Technical Analysis"];
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-IN");

export function UpsurgeCatalog() {
  const locale = useLocale();
  const router = useRouter();
  const query = useSearchParams();
  const [pending, startTransition] = useTransition();
  const category = query.get("category") || "";
  const search = query.get("search")?.trim() || "";
  const pro = query.get("pro") === "true";
  const level = query.get("level") || "";
  const sort = query.get("sort") || "popular";
  const filtered = Boolean(category || search || pro || level || sort !== "popular");

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(query.toString());
    if (value) next.set(key, value); else next.delete(key);
    startTransition(() => router.replace(`/${locale}/courses${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const normalize = (text: string) => text.toLowerCase().replace(/options/g, "option");
  const courses = courseData.filter(course => {
    const matchesCategory = !category || course.categories.some(value => normalize(value) === normalize(category));
    const haystack = normalize([course.title, course.instructor, ...course.categories].join(" "));
    return matchesCategory && (!search || haystack.includes(normalize(search))) && (!pro || course.pro) && (!level || course.level === level);
  }).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : 0);

  return (
    <div className={styles.catalog}>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href={`/${locale}`}>Home</Link><ChevronRight aria-hidden="true" /><span aria-current="page">Courses</span></nav>
          <h1 id="catalog-title">Explore Stock Market Courses</h1>
          <ul className={styles.metrics} aria-label="Reference catalog statistics">
            <li><BookOpen aria-hidden="true" />379 courses</li><li><Grid2X2 aria-hidden="true" />20 categories</li><li><Users aria-hidden="true" />138 instructors</li>
          </ul>
        </div>
      </section>
      <section className={`${styles.container} ${styles.results}`} aria-labelledby="all-courses-title" aria-busy={pending}>
        <h2 id="all-courses-title">All Courses</h2>
        <div className={styles.toolbar}>
          <div className={styles.categoryControls}>
            <Popover>
              <PopoverTrigger className={styles.filterButton}><ListFilter aria-hidden="true" />Filters<ChevronDown aria-hidden="true" /></PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <div className={styles.filterPanel}>
                  <h3>Refine your courses</h3>
                  <div className={styles.filterField}><label htmlFor="catalog-level">Level</label><select id="catalog-level" value={level} onChange={event => updateFilter("level", event.target.value)}><option value="">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                  <div className={styles.filterField}><label htmlFor="catalog-sort">Sort by</label><select id="catalog-sort" value={sort} onChange={event => updateFilter("sort", event.target.value)}><option value="popular">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select></div>
                  <Link href={`/${locale}/courses`} className={styles.clear}>Reset all filters</Link>
                </div>
              </PopoverContent>
            </Popover>
            <div className={styles.divider} aria-hidden="true" />
            <div className={styles.pills} aria-label="Course categories">
              {categories.map(item => <button key={item} type="button" className={styles.pill} aria-pressed={category === item} onClick={() => updateFilter("category", category === item ? "" : item)}>{item}</button>)}
            </div>
          </div>
          <label className={styles.proFilter} htmlFor="catalog-pro">Free with <span>PRO</span><Switch id="catalog-pro" checked={pro} onCheckedChange={checked => updateFilter("pro", checked ? "true" : "")} aria-label="Free with PRO" /></label>
        </div>
        {filtered && <div className={styles.activeFilters}><p role="status">{pending ? "Updating courses…" : `${courses.length} courses${search ? ` matching “${search}”` : " found"}`}</p><Link href={`/${locale}/courses`} className={styles.clear}><X aria-hidden="true" />Clear filters</Link></div>}
        {courses.length > 0 ? (
          <div className={styles.grid}>
            {courses.map((course, index) => (
              <article className={styles.card} key={course.slug}>
                <Link href={`/${locale}/courses/${course.slug}`} className={styles.courseLink}>
                  <div className={styles.thumbnail}>
                    <Image src={course.image} alt={course.title} width={1048} height={590} sizes="(max-width: 640px) 94vw, (max-width: 1050px) 46vw, 29vw" loading={index < 3 ? "eager" : "lazy"} />
                    {course.bestseller && <span className={styles.bestseller}>Bestseller</span>}
                  </div>
                  <div className={styles.titleRow}><h3>{course.title}</h3><span className={styles.rating} aria-label={`${course.rating} out of 5 stars`}><Star aria-hidden="true" />{course.rating.toFixed(1)}</span></div>
                  <p className={styles.byline}>{count.format(course.learners)} learners · by {course.instructor}</p>
                  <p className={styles.price}><strong>{money.format(course.price)}</strong><del>{money.format(course.originalPrice)}</del><span>SAVE {Math.round((1 - course.price / course.originalPrice) * 100)}%</span></p>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty} role="status"><Search aria-hidden="true" /><h3>No matching courses found</h3><p>Try another category or clear your filters to explore all courses.</p><Link href={`/${locale}/courses`} className={styles.clear}>Clear filters</Link></div>
        )}
      </section>
      <button type="button" className={styles.backToTop} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><ArrowUp aria-hidden="true" /></button>
    </div>
  );
}
