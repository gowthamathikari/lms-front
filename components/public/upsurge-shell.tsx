"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UpsurgeLoginContent } from "./upsurge-login-dialog";
import { UpsurgeSearchDialog } from "./upsurge-search-dialog";
import catalogCourses from "./upsurge-catalog-data.json";
import Image from "next/image";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Bell, ChartNoAxesCombined, CircleHelp, CirclePlay, Crown, LogOut, UserRound, ChevronDown, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import styles from "./upsurge.module.css";

const upsurgeFont = localFont({
  src: [
    { path: "../../public/upsurge/figtree-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/upsurge/figtree-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/upsurge/figtree-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/upsurge/figtree-700.ttf", weight: "700", style: "normal" },
    { path: "../../public/upsurge/figtree-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-upsurge",
  display: "swap",
});

const categories = ["Options Trading", "Technical Analysis", "Trading Strategy", "Stock Market Investing", "Crypto"];

function Brand({ href }: { href: string }) {
  return <Link href={href} className={styles.brand}><Image src="/upsurge/logo.png" alt="" width={30} height={30} /><span>Upsurge.club</span></Link>;
}

export function UpsurgeShell({ children, navbar, footer, enabled }: { children: ReactNode; navbar: ReactNode; footer: ReactNode; enabled: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedAuth = searchParams.get("auth");
  const authFromUrl = requestedAuth === "login" || requestedAuth === "signup";
  function changeLoginOpen(open: boolean) {
    setLoginOpen(open);
    if (!open && authFromUrl) {
      const query = new URLSearchParams(searchParams.toString());
      query.delete("auth");
      router.replace(pathname + (query.size ? "?" + query.toString() : ""), { scroll: false });
    }
  }
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    let active = true;
    let changed = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      changed = true;
      if (active) {
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN") setLoginOpen(false);
      }
    });
    void supabase.auth.getUser().then(({ data }) => { if (active && !changed) setUser(data.user); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [enabled, locale, router]);
  async function logout() {
    setLoggingOut(true); setLogoutError("");
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      setUser(null); router.replace(catalog); router.refresh();
    } catch { setLogoutError("Unable to log out. Please try again."); }
    finally { setLoggingOut(false); }
  }
  const [signUp, setSignUp] = useState(false);
  const pathname = usePathname();
  const home = `/${locale}`;
  const catalog = `${home}/courses`;
  const isHomepage = pathname === "/" || pathname === home || pathname === `${home}/`;
  const isCatalog = pathname === catalog || pathname === `${catalog}/` || catalogCourses.some(course => pathname === `${catalog}/${course.slug}` || pathname === `${catalog}/${course.slug}/`);
  const isLearning = pathname === home + "/my-learning" || pathname === home + "/my-learning/";
  const isProfile = pathname === home + "/user/profile/edit" || pathname === home + "/user/profile/edit/";
  if (!enabled || (!isHomepage && !isCatalog && !isLearning && !isProfile)) {
    return <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">{navbar}<main className="flex-1">{children}</main>{footer}</div>;
  }
  return (
    <Dialog open={loginOpen || (authFromUrl && !user)} onOpenChange={changeLoginOpen}>
    <div className={cn(styles.shell, upsurgeFont.variable)}>
      <a href="#main-content" className={styles.skip}>Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand href={home} />
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.navTrigger}>Courses <ChevronDown aria-hidden="true" /></DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-56"><DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={catalog} />}>All Courses</DropdownMenuItem>
                {categories.map((category) => <DropdownMenuItem key={category} render={<Link href={`${catalog}?search=${encodeURIComponent(category)}`} />}>{category}</DropdownMenuItem>)}
              </DropdownMenuGroup></DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.navTrigger}>Live <ChevronDown aria-hidden="true" /></DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-48"><DropdownMenuGroup>
                <DropdownMenuItem render={<a href="https://www.upsurge.club/webinars" />}>Webinars</DropdownMenuItem>
                <DropdownMenuItem render={<a href="https://www.upsurge.club/live-mentorships" />}>Mentorship Programs</DropdownMenuItem>
              </DropdownMenuGroup></DropdownMenuContent>
            </DropdownMenu>
            <a href="https://www.upsurge.club/indicators" className={styles.indicators}><span>New</span>Indicators</a>
          </nav>
          <UpsurgeSearchDialog catalog={catalog} fontClassName={upsurgeFont.variable} />
          <div className={styles.account}>{user ? <>
            <Link href={home + "/my-learning"} className={styles.myLearning}>My Learning</Link>
            <Link href={home + "/dashboard/notifications"} className={styles.notifications} aria-label="Notifications"><Bell size={26} /></Link>
            <DropdownMenu><DropdownMenuTrigger className={styles.avatar} aria-label="Open account menu">{String(user.user_metadata?.full_name || user.email || user.phone || "U").trim().charAt(0).toUpperCase()}</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(styles.accountMenu, upsurgeFont.variable)}><DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={home + "/dashboard"} />}><ChartNoAxesCombined />My Dashboard</DropdownMenuItem>
                <DropdownMenuItem render={<Link href={home + "/my-learning"} />}><CirclePlay />My Learning</DropdownMenuItem>
                <DropdownMenuItem render={<Link href={home + "/user/profile/edit"} />}><UserRound />My Profile</DropdownMenuItem>
                <DropdownMenuItem render={<Link href={home + "/pricing"} />}><Crown />Upgrade to PRO</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="https://www.upsurge.club/contact-us" />}><CircleHelp />Help</DropdownMenuItem>
                <DropdownMenuItem className={styles.logout} disabled={loggingOut} onClick={logout}><LogOut />{loggingOut ? "Logging out..." : "Logout"}</DropdownMenuItem>
              </DropdownMenuGroup></DropdownMenuContent>
            </DropdownMenu>
          </> : <><DialogTrigger onClick={() => setSignUp(false)} className="cursor-pointer text-left">Login</DialogTrigger><DialogTrigger onClick={() => setSignUp(true)} className={styles.signup}>Sign Up</DialogTrigger></>}</div>
          <div className={styles.mobileNav}>
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.mobileTrigger} aria-label="Open navigation"><Menu aria-hidden="true" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56"><DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={catalog} />}>All Courses</DropdownMenuItem>
                {categories.map((category) => <DropdownMenuItem key={category} render={<Link href={`${catalog}?search=${encodeURIComponent(category)}`} />}>{category}</DropdownMenuItem>)}
                <DropdownMenuItem render={<a href="https://www.upsurge.club/webinars" />}>Live Webinars</DropdownMenuItem>
                <DropdownMenuItem render={<a href="https://www.upsurge.club/live-mentorships" />}>Mentorship Programs</DropdownMenuItem>
                <DropdownMenuItem render={<a href="https://www.upsurge.club/indicators" />}>Indicators</DropdownMenuItem>
              </DropdownMenuGroup></DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {logoutError && <p role="alert" className={styles.logoutError}>{logoutError}</p>}
      <main id="main-content">{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><Brand href={home} /><p>Learn to trade. Learn to invest.<br />Learn from the experts.</p></div>
          <div><h2>Explore</h2><Link href={catalog}>All Courses</Link><a href="https://www.upsurge.club/webinars">Live Webinars</a><a href="https://www.upsurge.club/indicators">Indicators</a></div>
          <div><h2>My Account</h2><Link href={`${home}/dashboard/student`}>My Dashboard</Link><Link href={`${home}/my-learning`}>My Learning</Link><Link href={`${home}/user/profile/edit`}>My Profile</Link></div>
          <div><h2>Start learning</h2><DialogTrigger onClick={() => setSignUp(true)} className="cursor-pointer text-left">Create an account</DialogTrigger><DialogTrigger onClick={() => setSignUp(false)} className="cursor-pointer text-left">Login</DialogTrigger></div>
        </div>
      </footer>
    </div>
    {(loginOpen || (authFromUrl && !user)) && <UpsurgeLoginContent signUp={authFromUrl ? requestedAuth === "signup" : signUp} locale={locale} fontClassName={upsurgeFont.variable} />}
    </Dialog>
  );
}
