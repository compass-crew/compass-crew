import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Props {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, rows = 10, placeholder }: Props) {
  const [tab, setTab] = useState("write");
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="mt-2">
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder ?? "Write markdown here…"}
          className="font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-2">
        <div className="prose prose-sm dark:prose-invert min-h-[8rem] max-w-none rounded-md border border-border bg-muted/30 p-4">
          {value?.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-muted-foreground">Nothing to preview.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
