import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BookOpen, CirclePlay, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenantId } from "@/lib/supabase/tenant";
import styles from "@/components/public/upsurge-learning.module.css";

export const metadata = { title: "My Learning | Upsurge.club" };

export default async function MyLearningPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const home = "/" + locale;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(home + "/auth/login?next=" + encodeURIComponent(home + "/my-learning"));
  const tenantId = await getCurrentTenantId();
  const { data: enrollments, error } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id).eq("tenant_id", tenantId);
  const ids = [...new Set((enrollments ?? []).map(item => item.course_id))];
  const result = ids.length ? await supabase.from("courses").select("course_id, title, thumbnail_url").in("course_id", ids).eq("tenant_id", tenantId) : { data: [], error: null };
  const failed = error || result.error;
  return <div className={styles.page}>
    <div className={styles.offer}>?? Save Upto 60% on Courses! Offer Ends Today!</div>
    <section className={styles.heading}><div className={styles.container}>
      <nav aria-label="Breadcrumb"><Link href={home}>Home</Link><ChevronRight size={17} aria-hidden="true" /><span>My Learning</span></nav>
      <h1>My Learning</h1>
    </div></section>
    {failed ? <section className={styles.empty}><h2>Unable to load your courses</h2><p>Please try again in a moment.</p><Link className={styles.button} href={home + "/my-learning"}>Try again</Link></section>
    : !ids.length ? <section className={styles.empty}>
      <div className={styles.emptyIcon}><BookOpen size={76} strokeWidth={1.4} /><CirclePlay size={48} strokeWidth={1.6} /></div>
      <h2>You have not purchased any course yet</h2>
      <p>Choose from 100+ courses on options trading, technical analysis and more.</p>
      <Link className={styles.button} href={home + "/courses"}>See all courses <ChevronRight size={22} aria-hidden="true" /></Link>
    </section> : <section className={styles.grid} aria-label="Your courses">
      {(result.data ?? []).map(course => <Link className={styles.card} key={course.course_id} href={home + "/dashboard/student/courses/" + course.course_id}>
        <div className={styles.cover}>{course.thumbnail_url ? <Image src={course.thumbnail_url} alt="" width={640} height={360} unoptimized /> : <BookOpen size={52} aria-hidden="true" />}</div>
        <h2>{course.title}</h2><span>View course <ChevronRight size={18} aria-hidden="true" /></span>
      </Link>)}
      {!result.data?.length && <p>Your course details are currently unavailable. Please try again later.</p>}
    </section>}
  </div>;
}
