"""
Fix MDX issue: closing JSX tags indented with 2 spaces after markdown lists
are treated as list item continuations by MDX parser.
Solution: Remove leading whitespace from closing </TagName> lines.
"""
import os
import re

docs_dir = r'C:\code_documentation\src\content\docs'
fixed_files = []
total_fixes = 0

# Match lines that are ONLY a closing JSX tag (possibly indented)
closing_tag_re = re.compile(r'^(\s+)(</[A-Z][A-Za-z]*>)\s*$')

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
        file_fixes = 0

        for line in lines:
            stripped = line.strip()

            # Track code fence state
            if stripped.startswith('```') or stripped.startswith('~~~'):
                in_code = not in_code
                new_lines.append(line)
                continue

            if in_code:
                new_lines.append(line)
                continue

            # Remove indentation from standalone closing JSX tags
            m = closing_tag_re.match(line)
            if m:
                new_line = m.group(2) + '\n'
                if new_line != line:
                    changed = True
                    file_fixes += 1
                new_lines.append(new_line)
            else:
                new_lines.append(line)

        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            rel = os.path.relpath(fpath, docs_dir)
            fixed_files.append((rel, file_fixes))
            total_fixes += file_fixes

print(f'Fixed {len(fixed_files)} files ({total_fixes} closing tags de-indented):')
for f, count in fixed_files:
    print(f'  {f} ({count} fixes)')
