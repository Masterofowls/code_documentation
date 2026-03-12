import re


def fix_steps_block_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    result = []
    inside_steps = False
    inside_code_block = False
    need_indent = False

    for line in lines:
        if not inside_steps:
            if line.strip() == '<Steps>':
                inside_steps = True
            result.append(line)
            continue

        if line.strip() == '</Steps>':
            inside_steps = False
            result.append(line)
            continue

        if inside_code_block:
            if re.match(r'^`{3,}\s*$', line):
                # Closing fence
                result.append(('   ' if need_indent else '') + line)
                inside_code_block = False
                need_indent = False
            else:
                result.append(('   ' if need_indent else '') + line)
            continue

        # Opening code fence detection
        if re.match(r'^`{3,}', line):
            if not line.startswith('   '):
                # Unindented code fence - Issue B
                inside_code_block = True
                need_indent = True
                result.append('   ' + line)
            else:
                # Already indented code fence
                inside_code_block = True
                need_indent = False
                result.append(line)
            continue

        # Unindented prose text (not list item marker, not blank, not already indented, not special)
        if (line
                and not line[0].isspace()
                and not re.match(r'^\d+\.\s', line)
                and line[0] not in ('<', '|', '#', '-', '*', '!', ':', '>')):
            result.append('   ' + line)
            continue

        result.append(line)

    new_content = '\n'.join(result)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False


files = [
    r'C:\code_documentation\src\content\docs\db\graphql\getting-started.mdx',
    r'C:\code_documentation\src\content\docs\python\fastapi\authentication.mdx',
    r'C:\code_documentation\src\content\docs\python\fastapi\database.mdx',
    r'C:\code_documentation\src\content\docs\python\fastapi\getting-started.mdx',
    r'C:\code_documentation\src\content\docs\python\flask\database.mdx',
    r'C:\code_documentation\src\content\docs\python\flask\deployment.mdx',
    r'C:\code_documentation\src\content\docs\python\flask\index.mdx',
    r'C:\code_documentation\src\content\docs\python\pytorch\getting-started.mdx',
    r'C:\code_documentation\src\content\docs\web\emotion\getting-started.mdx',
    r'C:\code_documentation\src\content\docs\web\emotion\performance.mdx',
    r'C:\code_documentation\src\content\docs\web\emotion\theming.mdx',
    r'C:\code_documentation\src\content\docs\web\html\apis.mdx',
    r'C:\code_documentation\src\content\docs\web\tailwind\dark-mode.mdx',
    r'C:\code_documentation\src\content\docs\web\typescript\getting-started.mdx',
    r'C:\code_documentation\src\content\docs\infra\github-actions\secrets-env.mdx',
    r'C:\code_documentation\src\content\docs\shell\bash\scripts.mdx',
]

for f in files:
    changed = fix_steps_block_in_file(f)
    name = f.split('\\')[-1]
    status = 'FIXED' if changed else 'no change'
    print(f'{status}: {name}')
