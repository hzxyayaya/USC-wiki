import type MarkdownIt from 'markdown-it'

export default function wikilinks(md: MarkdownIt, options?: { permalinks?: Record<string, string> }) {
    md.inline.ruler.after('link', 'wikilink', (state, silent) => {
        const src = state.src
        const pos = state.pos

        // Check for [[
        if (src.charCodeAt(pos) !== 0x5B /* [ */ || src.charCodeAt(pos + 1) !== 0x5B /* [ */) {
            return false
        }

        // Find matching ]]
        const closeStart = src.indexOf(']]', pos + 2)
        if (closeStart === -1) {
            return false
        }

        // Capture content
        const content = src.slice(pos + 2, closeStart)
        // Check for newlines (wikilinks generally shouldn't span lines)
        if (content.includes('\n')) {
            return false
        }

        if (!silent) {
            // Split by | for Label
            // [[Target|Label]] -> target=Target, label=Label
            // [[Target]] -> target=Target, label=Target
            let target = content
            let label = content
            const splitIndex = content.indexOf('|')
            if (splitIndex !== -1) {
                target = content.slice(0, splitIndex)
                label = content.slice(splitIndex + 1)
            }

            // Construct standard link token
            // We rely on VitePress/markdown-it to handle the href resolution if we provide a proper path?
            // Actually standard markdown link is [label](target).
            // We can push tokens equivalent to that.

            const tokenStart = state.push('link_open', 'a', 1)
            // Basic normalization: 
            // If valid URL, leave as is.
            // If path, ensure encoded? md.normalizeLink does this?

            let href = target.trim()

            // Try to resolve against permalinks
            if (options?.permalinks && options.permalinks[href]) {
                href = options.permalinks[href]
            }

            // VitePress logic often needs .md extension removal or addition in resolving?
            // Standard [text](link) works.
            // We just emulate that.

            const attrs: [string, string][] = [['href', href]]
            tokenStart.attrs = attrs

            // Inner text token
            const tokenText = state.push('text', '', 0)
            tokenText.content = label.trim()

            const tokenEnd = state.push('link_close', 'a', -1)
        }

        state.pos = closeStart + 2
        return true
    })

    // Add a core rule to post-process standard markdown links [label](target)
    md.core.ruler.push('resolve_links', (state) => {
        if (!options?.permalinks) return

        state.tokens.forEach(blockToken => {
            if (blockToken.type === 'inline' && blockToken.children) {
                blockToken.children.forEach(token => {
                    if (token.type === 'link_open') {
                        const originalHref = token.attrGet('href')
                        if (!originalHref) return

                        // Decode URI for Chinese characters
                        let key = decodeURI(originalHref)

                        // Remove .md extension if present
                        if (key.endsWith('.md')) {
                            key = key.slice(0, -3)
                        }

                        // Try resolve
                        if (options!.permalinks && options!.permalinks[key]) {
                            token.attrSet('href', options!.permalinks[key])
                        }
                    }
                })
            }
        })
    })
}
