"""
Fix MDX files where code fences have content on the same opening line.
Pattern: ```lang some content here
Should be: ```lang\nsome content here\n```
"""
import re
from pathlib import Path

def fix_file(filepath):
    content = filepath.read_text(encoding='utf-8')
    lines = content.split('\n')
    new_lines = []
    changed = 0
    in_code_fence = False
    fence_lang = None

    i = 0
    while i < len(lines):
        line = lines[i]
        
        if not in_code_fence:
            # Check for opening fence with content on same line
            m = re.match(r'^(\s*)(```+)([a-zA-Z0-9_+-]*)(\s+)(.+)$', line)
            if m:
                indent = m.group(1)
                fence = m.group(2)
                lang = m.group(3)
                content_start = m.group(5)
                
                # Check if the content is NOT another fence start
                # and NOT empty
                # Emit: fence on its own line, then the content line
                new_lines.append(f'{indent}{fence}{lang}')
                new_lines.append(f'{indent}{content_start}')
                in_code_fence = True
                fence_lang = lang
                changed += 1
                i += 1
                continue
            
            # Normal opening fence without inline content
            m2 = re.match(r'^(\s*)(```+)([a-zA-Z0-9_+-]*)$', line)
            if m2:
                in_code_fence = True
                fence_lang = m2.group(3)
        else:
            # Inside fence - look for closing fence possibly with content on same line
            # e.g. "content ```" or just "```"
            m = re.match(r'^(\s*)(```+)\s*$', line)
            if m:
                in_code_fence = False
                fence_lang = None
            # Also handle closing fence that appears after content: "content ```"
            # This is rare but fix: split into content line + fence line
            m2 = re.match(r'^(.*\S)\s+(```+)\s*$', line)
            if m2 and not re.match(r'^(\s*)(```+)', line):
                new_lines.append(m2.group(1))
                new_lines.append(m2.group(2))
                in_code_fence = False
                fence_lang = None
                changed += 1
                i += 1
                continue
        
        new_lines.append(line)
        i += 1
    
    if changed:
        filepath.write_text('\n'.join(new_lines), encoding='utf-8')
        print(f'Fixed {changed} fence(s) in {filepath.relative_to(Path("C:/code_documentation"))}')
    
    return changed


root = Path('C:/code_documentation')
docs = root / 'src/content/docs'
total = 0
files = 0

for f in docs.rglob('*.mdx'):
    n = fix_file(f)
    if n:
        total += n
        files += 1

print(f'\nTotal: {total} fixes in {files} files')
