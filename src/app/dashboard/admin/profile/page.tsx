"use client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function AdminProfilePage() {
  return (
    <>
      <PageHeader title="My profile" description="Update your name, phone number and profile image." />
      <ProfileForm />
    </>
  );
}
