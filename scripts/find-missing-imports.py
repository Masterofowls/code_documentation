import re
from pathlib import Path

docs = Path('src/content/docs')
for f in docs.rglob('*.mdx'):
    content = f.read_text(encoding='utf-8')
    imported = set(re.findall(r'import\s+\{([^}]+)\}', content))
    import_flat = set()
    for imp in imported:
        for name in imp.split(','):
            import_flat.add(name.strip())
    for m in re.findall(r'import\s+(\w+)\s+from', content):
        import_flat.add(m)
    
    used = set(re.findall(r'<([A-Z][a-zA-Z0-9]*)', content))
    missing = used - import_flat
    if missing:
        print(f'{f.relative_to(Path("."))}: missing {missing}')
