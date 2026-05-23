import { fillTemplate } from "../data/mockInvite";
import type { Invite } from '@/types/talk';

type Part = { text: string; highlight: boolean };

function splitHighlighted(text: string): Part[] {
  const parts: Part[] = [];
  const re = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: match[1], highlight: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  return parts.length > 0 ? parts : [{ text, highlight: false }];
}

type Tag = "p" | "h1" | "span";

interface Props {
  text: string;
  className?: string;
  as?: Tag;
  invite?: Invite;
}

export function RichText({ text, className, as = "span", invite }: Props) {
  const resolved = invite ? fillTemplate(text, invite) : text;
  const parts = splitHighlighted(resolved);
  const Tag = as;

  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        const lines = part.text.split("\n");
        const lineNodes = lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {line}
          </span>
        ));

        return part.highlight ? (
          <span key={i} className="text-key">
            {lineNodes}
          </span>
        ) : (
          <span key={i}>{lineNodes}</span>
        );
      })}
    </Tag>
  );
}
