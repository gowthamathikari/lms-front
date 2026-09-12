"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import Image from "next/image";
import { X } from "lucide-react";
import { DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import { cn } from "@/lib/utils";
import styles from "./upsurge-login-dialog.module.css";

export function UpsurgeLoginContent({ locale, fontClassName, signUp = false }: { locale: string; fontClassName: string; signUp?: boolean }) {
  const [isSignUp, setIsSignUp] = useState(signUp);
  const tenantId = "00000000-0000-0000-0000-000000000001";
  const destination = "/" + locale + "/courses";
  return <DialogPortal>
    <DialogOverlay className={styles.overlay} />
    <DialogPrimitive.Popup className={cn(styles.modal, fontClassName)}>
      <DialogClose className={styles.close} aria-label="Close authentication"><X size={20} aria-hidden="true" /></DialogClose>
      <div className={styles.logo}><Image src="/upsurge/logo.png" alt="" width={40} height={40} /></div>
      <DialogTitle className={styles.title}>Welcome to Upsurge.club</DialogTitle>
      <DialogDescription className="sr-only">{isSignUp ? "Create an account with your email and password." : "Sign in to your account."}</DialogDescription>
      <div className={styles.passwordPanel}>
        {isSignUp
          ? <SignUpForm tenantId={tenantId} redirectAfterAuth={destination} onSwitchAuth={() => setIsSignUp(false)} />
          : <LoginForm tenantId={tenantId} redirectAfterAuth={destination} onSwitchAuth={() => setIsSignUp(true)} />}
      </div>
    </DialogPrimitive.Popup>
  </DialogPortal>;
}
