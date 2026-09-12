"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronDown, Menu, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import styles from "./upsurge.module.css";

const categories = ["Options Trading", "Technical Analysis", "Trading Strategy", "Stock Market Investing", "Crypto"];

function Brand({ href }: { href: string }) {
  return <Link href={href} className={styles.brand}><Image src="/upsurge/logo.png" alt="" width={30} height={30} /><span>Upsurge.club</span></Link>;
}

export function UpsurgeShell({ children, navbar, footer, enabled }: { children: ReactNode; navbar: ReactNode; footer: ReactNode; enabled: boolean }) {
  const pathname = usePathname();
  const locale = useLocale();
  const home = `/${locale}`;
  const catalog = `${home}/courses`;
  const isHomepage = pathname === "/" || pathname === home || pathname === `${home}/`;
  if (!enabled || !isHomepage) {
    return <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">{navbar}<main className="flex-1">{children}</main>{footer}</div>;
  }
  return (
    <div className={styles.shell}>
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
          <form action={catalog} method="get" role="search" className={styles.search}>
            <label className="sr-only" htmlFor="upsurge-search">Search courses</label>
            <input id="upsurge-search" name="search" type="search" placeholder="Search for 'Options Trading'" maxLength={150} />
            <button type="submit" aria-label="Search courses"><Search aria-hidden="true" /></button>
          </form>
          <div className={styles.account}><Link href={`${home}/auth/login`}>Login</Link><Link href={`${home}/auth/sign-up`} className={styles.signup}>Sign Up</Link></div>
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
      <main id="main-content">{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><Brand href={home} /><p>Learn to trade. Learn to invest.<br />Learn from the experts.</p></div>
          <div><h2>Explore</h2><Link href={catalog}>All Courses</Link><a href="https://www.upsurge.club/webinars">Live Webinars</a><a href="https://www.upsurge.club/indicators">Indicators</a></div>
          <div><h2>My Account</h2><Link href={`${home}/dashboard/student`}>My Dashboard</Link><Link href={`${home}/dashboard/student/courses`}>My Learning</Link><Link href={`${home}/dashboard/student/profile`}>My Profile</Link></div>
          <div><h2>Start learning</h2><Link href={`${home}/auth/sign-up`}>Create an account</Link><Link href={`${home}/auth/login`}>Login</Link></div>
        </div>
      </footer>
    </div>
  );
}