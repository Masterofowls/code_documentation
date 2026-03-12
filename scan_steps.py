import re
import os


def has_steps_issue(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    inside_steps = False
    inside_code = False
    issues = []
    for i, line in enumerate(lines, 1):
        if line.strip() == '<Steps>':
            inside_steps = True
            continue
        if line.strip() == '</Steps>':
            inside_steps = False
            inside_code = False
            continue
        if not inside_steps:
            continue
        if inside_code:
            if re.match(r'^`{3,}\s*$', line):
                inside_code = False
            continue
        if re.match(r'^`{3,}', line) and not line.startswith('   '):
            issues.append(f'line {i}: unindented code fence')
            inside_code = True
            continue
        if re.match(r'^`{3,}', line):
            inside_code = True
            continue
        if re.match(r'^:::', line):
            issues.append(f'line {i}: callout inside Steps')
    return issues


mdx_files = []
for root, dirs, files in os.walk(r'C:\code_documentation\src\content'):
    for f in files:
        if f.endswith('.mdx'):
            mdx_files.append(os.path.join(root, f))

found = False
for fp in sorted(mdx_files):
    issues = has_steps_issue(fp)
    if issues:
        rel = fp.replace(r'C:\code_documentation\src\content\docs' + os.sep, '')
        print(f'{rel}: {issues}')
        found = True

if not found:
    print('No issues found.')
