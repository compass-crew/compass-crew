import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
export type CertificateType = Database["public"]["Enums"]["certificate_type"];

export const CERT_TYPE_LABEL: Record<CertificateType, string> = {
  participation: "Certificate of Participation",
  winner: "Certificate of Achievement — Winner",
  runner_up: "Certificate of Achievement — Runner-up",
  special_mention: "Certificate of Special Mention",
  judge: "Certificate of Appreciation — Judge",
  mentor: "Certificate of Appreciation — Mentor",
  organizer: "Certificate of Appreciation — Organizer",
  campus_ambassador: "Certificate of Appreciation — Campus Ambassador",
  volunteer: "Certificate of Appreciation — Volunteer",
};

export async function listMyCertificates(userId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const { data, error } = await supabase.from("certificates").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  return data;
}

export function certPdfUrl(code: string): string {
  return `/api/public/certificates/${code}.pdf`;
}

export function certVerifyUrl(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/verify/${code}`;
}
