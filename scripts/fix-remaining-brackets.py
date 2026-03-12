import re
import os
from pathlib import Path

def fix_file(filepath):
    content = filepath.read_text(encoding='utf-8')
    lines = content.split('\n')
    new_lines = []
    in_code_fence = False
    changed = 0
    
    for line in lines:
        if re.match(r'^```', line):
            in_code_fence = not in_code_fence
        
        if in_code_fence:
            new_lines.append(line)
            continue
        
        # Skip import/export lines
        if re.match(r'^(import|export)\s', line):
            new_lines.append(line)
            continue
        
        orig = line
        # < followed by digit, comma, space, (, ) — not valid JSX/HTML tag start
        line = re.sub(r'<(?=[0-9,\(\)])', '&lt;', line)
        # << (heredoc etc) not followed by =
        line = re.sub(r'<<(?![=<])', '&lt;&lt;', line)
        
        if line != orig:
            changed += 1
        new_lines.append(line)
    
    if changed:
        filepath.write_text('\n'.join(new_lines), encoding='utf-8')
        print(f"Fixed {changed} issues in {filepath.relative_to(Path('C:/code_documentation'))}")
    
    return changed

root = Path('C:/code_documentation')
docs_dir = root / 'src/content/docs'
total = 0
for mdx in docs_dir.rglob('*.mdx'):
    total += fix_file(mdx)

print(f'\nTotal fixes: {total}')
