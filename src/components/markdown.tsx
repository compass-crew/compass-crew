import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/**
 * Sanitized markdown renderer. Blocks raw HTML, `javascript:` and other
 * unsafe URL schemes, and unknown tags/attributes. Only http(s)/mailto/tel
 * URLs are permitted on anchors and images.
 */

const SAFE_SCHEMES = /^(https?:|mailto:|tel:)/i;

// react-markdown 9 wires rehype-sanitize by default only if you pass it;
// we extend the default schema to explicitly limit URL protocols.
const schema: typeof defaultSchema = {
  ...defaultSchema,
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ["http", "https", "mailto", "tel"],
    src: ["http", "https"],
  },
  // Never allow raw HTML through — rehype-sanitize already drops unknown
  // tags, but ensure `iframe`, `script`, `style`, and event handlers stay
  // out even if a plugin re-introduces them.
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (t) => !["iframe", "script", "style", "object", "embed", "form", "input", "button"].includes(t),
  ),
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    // Strip event handlers on every element.
    "*": (defaultSchema.attributes?.["*"] ?? []).filter(
      (a) => typeof a === "string" && !a.toLowerCase().startsWith("on"),
    ),
  },
};

function isSafeHref(href: string | undefined): boolean {
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#")) return true;
  return SAFE_SCHEMES.test(href);
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-body space-y-4 text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-lg">
      <ReactMarkdown
        // Skip any raw HTML embedded in the markdown source.
        skipHtml
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ node: _node, href, ...props }) => {
            if (!isSafeHref(href)) return <span {...props} />;
            const external = /^https?:/i.test(href!);
            return (
              <a
                {...props}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
              />
            );
          },
          img: ({ node: _node, src, alt, ...props }) => {
            if (!src || !/^https?:/i.test(src)) return null;
            return <img {...props} src={src} alt={alt ?? ""} loading="lazy" />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
