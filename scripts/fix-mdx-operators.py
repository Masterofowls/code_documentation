import os
import re

docs_dir = r'C:\code_documentation\src\content\docs'
fixed_files = []

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
            if stripped.startswith('```') or stripped.startswith('~~~'):
                in_code = not in_code
                new_lines.append(line)
                continue

            if in_code:
                new_lines.append(line)
                continue

            orig = line

            # Replace < followed by digit or comma (comparison operator, not JSX tag)
            # But don't touch already-escaped entities or JSX component tags (uppercase letter)
            new_line = re.sub(r'(?<!&lt)(?<!&amp)(?<!\\)<(?=[0-9,)\s])', '&lt;', line)

            if new_line != orig:
                changed = True
            new_lines.append(new_line)

        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            rel = os.path.relpath(fpath, docs_dir)
            fixed_files.append(rel)

print(f'Fixed {len(fixed_files)} files:')
for f in fixed_files:
    print(f'  {f}')
