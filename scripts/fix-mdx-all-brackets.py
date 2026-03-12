"""
Comprehensive MDX < escaping:
- Fixes bare < that aren't valid JSX/HTML tag starters
- Handles: <<, <(, <number, <space, <comma, <), etc.
- Skips content inside code fences
- Skips already-escaped entities
"""
import os
import re

docs_dir = r'C:\code_documentation\src\content\docs'
fixed_files = []
total = 0

# Chars after < that indicate it's NOT a JSX/HTML tag (needs escaping)
# JSX/HTML tags start with: letter, /, !, ? (processing instruction)
SAFE_TAG_CHARS = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/!?')

def fix_line(line):
    """Escape bare < characters that aren't valid JSX/HTML tags."""
    # Skip if already an entity
    result = []
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == '<':
            # Check what follows
            next_ch = line[i+1] if i+1 < len(line) else ''
            # If next char starts a valid tag/entity, keep as-is
            if next_ch in SAFE_TAG_CHARS:
                result.append(ch)
            elif line[i:i+4] == '&lt;':
                # Already escaped
                result.append(ch)
            else:
                # Bare < that isn't a tag - escape it
                result.append('&lt;')
        else:
            result.append(ch)
        i += 1
    return ''.join(result)

for root, dirs, files in os.walk(docs_dir):
    for fname in files:
        if not fname.endswith('.mdx'):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        in_code = False
        new_lines = []
        changed = False

        for line in lines:
            stripped = line.strip()

            # Track code fence state
            if re.match(r'^(`{3,}|~{3,})', stripped):
                in_code = not in_code
                new_lines.append(line)
                continue

            if in_code:
                new_lines.append(line)
                continue

            # Skip import/export lines
            if stripped.startswith('import ') or stripped.startswith('export '):
                new_lines.append(line)
                continue

            orig = line
            new_line = fix_line(line)

            if new_line != orig:
                changed = True
            new_lines.append(new_line)

        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            rel = os.path.relpath(fpath, docs_dir)
            fixed_files.append(rel)
            total += 1

print(f'Fixed {total} files')
for f in fixed_files:
    print(f'  {f}')
