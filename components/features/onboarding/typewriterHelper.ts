
// --- HELPER: HTML-Safe Typewriter Slicer ---
export const getVisibleTextLength = (html: string) => {
    if (typeof document === 'undefined') return html.length; // Server-side safety
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent?.length || 0;
};

export const typewriterSafeSlice = (html: string, charCount: number) => {
    let visibleCount = 0;
    let output = "";
    let inTag = false;

    for (let i = 0; i < html.length; i++) {
        const char = html[i];

        if (char === "<") {
            inTag = true;
        } else if (char === ">") {
            inTag = false;
        }

        output += char;

        if (!inTag && char !== ">") {
            visibleCount++;
        }

        if (visibleCount >= charCount && !inTag) {
            break;
        }
    }
    
    // Simple tag closer (stack based)
    const openTags = [];
    const tagRegex = /<(\/?)(\w+)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(output)) !== null) {
        if (match[1]) { // Closing tag
            openTags.pop();
        } else if (!output.substring(match.index).startsWith('/>')) { // Opening tag (not self-closing)
             if(!match[0].endsWith('/>')) openTags.push(match[2]);
        }
    }
    
    // Append closing tags in reverse order
    for (let i = openTags.length - 1; i >= 0; i--) {
        output += `</${openTags[i]}>`;
    }

    return output;
};
