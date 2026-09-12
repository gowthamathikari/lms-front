import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpsurgeProfileForm } from "@/components/public/upsurge-profile-form";
import styles from "@/components/public/upsurge-profile.module.css";

export const metadata = { title: "Edit Profile | Upsurge.club" };

export default async function EditProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const home = `/${locale}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`${home}/auth/login?next=${encodeURIComponent(`${home}/user/profile/edit`)}`);
  const { data: profile, error } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();
  return <div className={styles.page}>
    <nav className={styles.sidebar} aria-label="My account">
      <Link href={`${home}/user/profile/edit`} aria-current="page">Edit Profile</Link>
      <Link href={`${home}/dashboard/student/certificates`}>My Certificates</Link>
      <Link href={`${home}/dashboard/student/billing`}>My Purchases</Link>
      <a href="https://www.upsurge.club/contact-us">My Tickets</a>
    </nav>
    <section className={styles.content} aria-labelledby="profile-title">
      <h1 id="profile-title" className="sr-only">Edit Profile</h1>
      {error || !profile ? <div role="alert"><h2>Unable to load your profile</h2><p>Please try again in a moment.</p><Link href={`${home}/user/profile/edit`}>Try again</Link></div> : <UpsurgeProfileForm profile={profile} account={{ id: user.id, email: user.email ?? "", phone: user.phone ?? "", phoneVerified: Boolean(user.phone_confirmed_at), emailVerified: Boolean(user.email_confirmed_at), gender: typeof user.user_metadata?.gender === "string" ? user.user_metadata.gender : "" }} />}
    </section>
  </div>;
}
