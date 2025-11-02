import React from 'react';

interface FormattedAnalysisProps {
  text: string;
}

export const FormattedAnalysis: React.FC<FormattedAnalysisProps> = ({ text }) => {
  // Parse the text and format it properly
  const formatText = (content: string): React.ReactNode => {
    if (!content) return null;

    // Split by lines
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentSection: string[] = [];
    let currentList: string[] = [];
    let inList = false;
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim();
        if (paraText) {
          elements.push(
            <p key={`para-${elements.length}`} className="text-gray-700 mb-3 leading-relaxed">
              {paraText}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-700 text-sm">
                {item.trim()}
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        flushParagraph();
        flushList();
        return;
      }

      // Main heading (##)
      if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
            {trimmedLine.replace(/^##\s+/, '')}
          </h2>
        );
        return;
      }

      // Subheading (###)
      if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {trimmedLine.replace(/^###\s+/, '')}
          </h3>
        );
        return;
      }

      // Bold heading (**TEXT** or **TEXT:**)
      if (trimmedLine.match(/^\*\*[^*]+\*\*:?\s*$/)) {
        flushParagraph();
        flushList();
        const headingText = trimmedLine.replace(/\*\*/g, '').replace(/:\s*$/, '');
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-semibold text-gray-900 mt-4 mb-2">
            {headingText}
          </h4>
        );
        return;
      }

      // Bold heading with content (**TEXT:** content)
      if (trimmedLine.match(/^\*\*[^*]+\*\*:\s+/)) {
        flushParagraph();
        flushList();
        const match = trimmedLine.match(/^\*\*([^*]+)\*\*:\s+(.+)$/);
        if (match) {
          const headingText = match[1];
          const content = match[2];
          elements.push(
            <div key={`h4-content-${index}`} className="mt-4 mb-2">
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {headingText}
              </h4>
              <p className="text-gray-700 text-sm">{content}</p>
            </div>
          );
          return;
        }
      }

      // List items (- or *)
      if (trimmedLine.match(/^[-*]\s+/)) {
        flushParagraph();
        const listItem = trimmedLine.replace(/^[-*]\s+/, '').trim();
        if (listItem) {
          currentList.push(listItem);
          inList = true;
        }
        return;
      }

      // Horizontal rule
      if (trimmedLine.startsWith('---')) {
        flushParagraph();
        flushList();
        elements.push(<hr key={`hr-${index}`} className="my-4 border-gray-300" />);
        return;
      }

      // Process text with markdown formatting (bold **text**, italic *text*)
      // This handles both bold and italic, and cleans up any stray asterisks
      flushList();
      
      // Function to process inline markdown in text
      const processInlineMarkdown = (text: string): React.ReactNode[] => {
        // First, handle bold (**text**), then italic (*text*), avoiding conflicts
        // Split by bold markers first
        const parts: React.ReactNode[] = [];
        let remaining = text;
        
        // Process bold (**text**) - higher priority
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(remaining)) !== null) {
          // Add text before the bold
          if (match.index > lastIndex) {
            const beforeText = remaining.substring(lastIndex, match.index);
            // Process italic in the text before
            parts.push(...processItalic(beforeText));
          }
          // Add bold text
          parts.push(
            <strong key={`bold-${parts.length}`} className="font-semibold text-gray-900">
              {match[1]}
            </strong>
          );
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text and process italic
        if (lastIndex < remaining.length) {
          const afterText = remaining.substring(lastIndex);
          const italicParts = processItalic(afterText);
          parts.push(...italicParts);
        }
        
        // If no parts were added, return the text with any stray asterisks cleaned
        if (parts.length === 0) {
          const cleaned = remaining.replace(/\*/g, ''); // Remove any stray asterisks
          return cleaned ? [<span key="text">{cleaned}</span>] : [<span key="text">{remaining}</span>];
        }
        
        return parts;
      };
      
      // Helper function to process italic (*text*) - not at start of line for list items
      const processItalic = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        // Match italic (*text*) - single asterisk, not double
        // Process manually to avoid lookbehind/lookahead issues
        let remaining = text;
        let lastIndex = 0;
        
        // Find all potential italic matches (single asterisk pairs)
        const matches: Array<{ start: number; end: number; content: string }> = [];
        let i = 0;
        while (i < remaining.length) {
          if (remaining[i] === '*' && i + 1 < remaining.length && remaining[i + 1] !== '*') {
            // Found a single asterisk, look for closing asterisk
            const start = i;
            i++;
            const contentStart = i;
            let found = false;
            
            while (i < remaining.length) {
              if (remaining[i] === '*') {
                // Check if it's followed by another asterisk (would be bold)
                if (i + 1 < remaining.length && remaining[i + 1] === '*') {
                  // Skip, this is part of bold
                  break;
                }
                // Found closing asterisk for italic
                matches.push({
                  start,
                  end: i + 1,
                  content: remaining.substring(contentStart, i)
                });
                found = true;
                i++;
                break;
              }
              i++;
            }
            if (!found) break;
          } else {
            i++;
          }
        }
        
        // Build parts from matches
        let textIndex = 0;
        matches.forEach((match, idx) => {
          // Add text before italic
          if (match.start > textIndex) {
            parts.push(<span key={`text-${idx}`}>{remaining.substring(textIndex, match.start)}</span>);
          }
          // Add italic text
          parts.push(
            <em key={`italic-${idx}`} className="italic">
              {match.content}
            </em>
          );
          textIndex = match.end;
        });
        
        // Add remaining text (clean up any stray asterisks)
        if (textIndex < remaining.length) {
          let remainingText = remaining.substring(textIndex);
          // Remove unmatched single asterisks (simple approach - remove single * not between word chars)
          // This is a simple cleanup - we've already processed all valid markdown
          remainingText = remainingText.replace(/\*/g, ''); // Remove all remaining asterisks
          if (remainingText) {
            parts.push(<span key={`text-end`}>{remainingText}</span>);
          }
        }
        
        return parts.length > 0 ? parts : [<span key="text">{text.replace(/\*/g, '')}</span>];
      };
      
      // Apply markdown processing
      const formattedParts = processInlineMarkdown(trimmedLine);
      
      elements.push(
        <p key={`formatted-para-${index}`} className="text-gray-700 mb-2 leading-relaxed">
          {formattedParts}
        </p>
      );
      return;
    });

    flushParagraph();
    flushList();

    return elements.length > 0 ? <div className="space-y-2">{elements}</div> : null;
  };

  return (
    <div className="text-gray-700">
      {formatText(text)}
    </div>
  );
};

