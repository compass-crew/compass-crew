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

export type VerifiedCertificate = {
  code: string;
  recipient_name: string;
  type: CertificateType;
  subtitle: string;
  issued_at: string;
  hackathon_title: string | null;
  hackathon_slug: string | null;
};

export async function getCertificateByCode(code: string): Promise<VerifiedCertificate | null> {
  // Public verification goes through a server route that uses the admin
  // client with a narrow column projection. The verify_certificate RPC is
  // no longer callable by anon/authenticated to satisfy the linter.
  const res = await fetch(`/api/public/verify/${encodeURIComponent(code)}`, {
    headers: { accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Verification failed (${res.status})`);
  const json = (await res.json()) as { found: boolean; certificate?: VerifiedCertificate };
  if (!json.found || !json.certificate) return null;
  return json.certificate;
}

export function certPdfUrl(code: string): string {
  return `/api/public/certificates/${code}`;
}

export function certVerifyUrl(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/verify/${code}`;
}
