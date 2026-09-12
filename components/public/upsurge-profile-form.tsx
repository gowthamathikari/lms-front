"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, LockKeyhole } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import styles from "./upsurge-profile.module.css";

interface Props {
  profile: { full_name: string | null; avatar_url: string | null };
  account: { id: string; email: string; phone: string; phoneVerified: boolean; emailVerified: boolean; gender: string };
}

export function UpsurgeProfileForm({ profile, account }: Props) {
  const router = useRouter();
  const [name, setName] = useState(profile.full_name ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url ?? "");
  const [gender, setGender] = useState(account.gender);
  const [email, setEmail] = useState(account.email);
  const [busy, setBusy] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const disabled = busy || processingImage;

  async function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(""); setMessage("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG or WebP image smaller than 5 MB."); return; }
    setProcessingImage(true);
    try {
      // Keep the avatar small enough for the existing profile field; no public upload bucket is needed.
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const context = canvas.getContext("2d");
      if (!context) { bitmap.close(); throw new Error("Image processing unavailable"); }
      const side = Math.min(bitmap.width, bitmap.height);
      context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
      bitmap.close();
      setAvatar(canvas.toDataURL("image/webp", 0.8));
    } catch { setError("This image could not be opened. Please choose another image."); }
    finally { setProcessingImage(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) { setError("Enter your name."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase.from("profiles").update({ full_name: name.trim(), avatar_url: avatar || null }).eq("id", account.id).select("id").single();
      if (saveError || !data) throw new Error("Unable to save your profile. Please try again.");
      const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: name.trim(), gender } });
      if (metadataError) throw new Error("Your name and image were saved, but gender could not be saved. Please try again.");
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save your profile. Please try again."); }
    finally { setBusy(false); }
  }

  async function updateEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const { error: emailError } = await createClient().auth.updateUser({ email: email.trim() });
      if (emailError) throw emailError;
      setMessage("Check your email to confirm the change. You may also need to confirm it from your current email address.");
    } catch { setError("Unable to update your email. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className={styles.form}>
    <form id="save-profile" onSubmit={save}>
      <div className={styles.imageRow}>
        <Avatar className={styles.avatar}><AvatarImage src={avatar || undefined} alt="Profile photo" /><AvatarFallback>{(name.trim() || account.email || "U").charAt(0).toUpperCase()}</AvatarFallback></Avatar>
        <label className={styles.imageButton}><Camera size={21} aria-hidden="true" />{processingImage ? "Preparing image…" : "Add Image"}<input className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} disabled={disabled} aria-label="Add profile image" /></label>
      </div>
      <FieldGroup className={styles.fields}>
        <Field><FieldLabel htmlFor="profile-name">Name:</FieldLabel><input className={styles.input} id="profile-name" autoComplete="name" value={name} maxLength={120} required disabled={disabled} onChange={event => setName(event.target.value)} /></Field>
        <Field><FieldLabel htmlFor="profile-phone">Phone Number:<LockKeyhole size={14} aria-hidden="true" /></FieldLabel><div className={styles.inputRow}><input id="profile-phone" type="tel" value={account.phone ? account.phone.replace(/.(?=.{3})/g, (char, offset: number) => offset < 3 ? char : "*") : "No phone number added"} readOnly /><span className={styles.verified}>{account.phoneVerified ? "Verified" : ""}</span></div></Field>
      </FieldGroup>
    </form>
    <form onSubmit={updateEmail}>
      <Field><FieldLabel htmlFor="profile-email">Email ID:</FieldLabel><div className={styles.inputRow}><input id="profile-email" type="email" autoComplete="email" placeholder="Enter your Email" value={email} maxLength={254} required disabled={disabled} onChange={event => setEmail(event.target.value)} />{email === account.email && account.emailVerified ? <span className={styles.verified}>Verified</span> : <button type="submit" disabled={disabled || !email.trim() || email.trim() === account.email}>{account.email ? "Update Email" : "Add Email"}</button>}</div></Field>
    </form>
    <FieldSet className={styles.gender}><FieldLegend>Gender:</FieldLegend><div className={styles.radios}>{["Male", "Female", "Prefer Not to Say"].map(value => <label key={value}><input type="radio" name="gender" form="save-profile" value={value} checked={gender === value} disabled={disabled} onChange={() => setGender(value)} />{value}</label>)}</div></FieldSet>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.message} role="status">{message}</p>}
    <button type="submit" form="save-profile" className={styles.save} disabled={disabled}>{busy ? "Saving…" : "Save Changes"}</button>
  </div>;
}
