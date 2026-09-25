"""Small repository-level guard for the published skill package."""
from pathlib import Path
import re
import sys


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    skill = root / "SKILL.md"
    errors: list[str] = []
    if not skill.exists():
        errors.append("SKILL.md is missing")
    else:
        text = skill.read_text(encoding="utf-8")
        if not text.startswith("---\n") or "\n---\n" not in text[4:]:
            errors.append("SKILL.md must have YAML frontmatter")
        for key in ("name:", "description:"):
            if key not in text.split("\n---\n", 1)[0]:
                errors.append(f"SKILL.md frontmatter missing {key}")
        if "TODO" in text or "<skill-name>" in text:
            errors.append("SKILL.md contains unfinished scaffold text")
        for link in re.findall(r"\]\((references/[^)]+)\)", text):
            if not (root / link).exists():
                errors.append(f"missing reference linked from SKILL.md: {link}")
    for required in ("agents/openai.yaml", "README.md", "LICENSE", "package.json", "engine/src/index.tsx"):
        if not (root / required).exists():
            errors.append(f"required file is missing: {required}")
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors))
        return 1
    print(f"Skill package valid: {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
