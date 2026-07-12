import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cmsMediaUrl, removeCmsImage, uploadCmsImage } from "@/lib/cms-media";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, folder = "misc", label = "Image" }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const preview = cmsMediaUrl(value);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadCmsImage(file, folder);
      onChange(url);
      toast.success("Uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) return;
    setBusy(true);
    try {
      await removeCmsImage(value);
    } catch {
      // ignore, still clear
    }
    onChange(null);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-4">
        <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1.5 h-4 w-4" />}
            {preview ? "Replace" : "Upload"}
          </Button>
          {preview && (
            <Button type="button" size="sm" variant="ghost" onClick={handleRemove} disabled={busy}>
              <X className="mr-1.5 h-4 w-4" /> Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">PNG / JPG / WebP · up to 8 MB</p>
        </div>
      </div>
    </div>
  );
}
