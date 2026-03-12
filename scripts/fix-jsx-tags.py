"""
Fix MDX files where uppercase 'tags' in text content are parsed as JSX.
Escapes <UppercaseName> and </UppercaseName> that aren't valid Starlight/MDX components.
"""
import re
from pathlib import Path

# Known valid JSX components (don't escape these)
VALID_COMPONENTS = {
    'Tabs', 'TabItem', 'Steps', 'Aside', 'Card', 'CardGrid', 'Badge',
    'Icon', 'FileTree', 'LinkCard', 'LinkButton', 'Breadcrumbs',
    'Fragment', 'DocRef', 'OutputBlock', 'TipBlock', 'Bookmark', 'BookmarkList',
    'Code', 'Pre', 'Kbd',
}

# Patterns that look like JSX tags but are actually TypeScript generics / code references
# These uppercase names outside code fences need escaping
def escape_bare_jsx(content: str) -> tuple[str, int]:
    lines = content.split('\n')
    new_lines = []
    in_code_fence = False
    changed = 0

    for line in lines:
        # Track code fences
        stripped = line.strip()
        if re.match(r'^```', stripped):
            in_code_fence = not in_code_fence

        if in_code_fence:
            new_lines.append(line)
            continue

        # Skip import/export lines
        if re.match(r'^(import|export)\s', line):
            new_lines.append(line)
            continue

        orig = line

        # Escape closing tags for non-valid components: </SomeName>
        def escape_close(m):
            name = m.group(1)
            if name in VALID_COMPONENTS:
                return m.group(0)
            return f'&lt;/{name}&gt;'

        # Escape opening tags for non-valid components that clearly aren't JSX
        # Match <Name> or <Name/> where Name is uppercase, not a valid component
        # But only when they look "standalone" in text (preceded by space, (, or start)
        def escape_open(m):
            name = m.group(1)
            rest = m.group(2)  # the rest of the tag content
            if name in VALID_COMPONENTS:
                return m.group(0)
            # If rest contains props like key=value, it might be real JSX
            # But if it's just a bare <Name> or <Name/>, escape it
            return f'&lt;{name}{rest}&gt;'

        # Match </Name> not in valid set
        line = re.sub(r'</([A-Z][a-zA-Z0-9]*)>', escape_close, line)
        # Match <Name> or <Name/> not in valid set (simple tags without attributes)
        line = re.sub(r'<([A-Z][a-zA-Z0-9]*)(/?)>', escape_open, line)

        if line != orig:
            changed += 1
        new_lines.append(line)

    return '\n'.join(new_lines), changed


root = Path('C:/code_documentation')
docs = root / 'src/content/docs'
total_files = 0
total_fixes = 0

for f in docs.rglob('*.mdx'):
    content = f.read_text(encoding='utf-8')
    new_content, fixes = escape_bare_jsx(content)
    if fixes:
        f.write_text(new_content, encoding='utf-8')
        print(f'Fixed {fixes} tags in {f.relative_to(root)}')
        total_files += 1
        total_fixes += fixes

print(f'\nTotal: {total_fixes} fixes across {total_files} files')
