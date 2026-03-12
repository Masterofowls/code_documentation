import os
import re

docs = r'C:\code_documentation\src\content\docs'
problem_files = []

for root, dirs, files in os.walk(docs):
    for f in files:
        if not f.endswith('.mdx'):
            continue
        path = os.path.join(root, f)
        content = open(path, encoding='utf-8').read()
        # Find <Steps> blocks that contain <Tabs>
        steps_match = re.search(r'<Steps>.*?</Steps>', content, re.DOTALL)
        if steps_match and '<Tabs>' in steps_match.group():
            problem_files.append(path)

print(f'{len(problem_files)} files with <Tabs> inside <Steps>:')
for f in problem_files:
    rel = os.path.relpath(f, docs)
    print(f'  {rel}')
