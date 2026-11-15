"""Web/index.src.html + Web/world_data.js → Web/rize_prototip.html (tek dosya)."""
from pathlib import Path
web = Path(__file__).resolve().parents[2] / "Web"
src = (web / "index.src.html").read_text(encoding="utf-8")
data = (web / "world_data.js").read_text(encoding="utf-8")
out = src.replace("/*WORLD_DATA*/", data, 1)
(web / "rize_prototip.html").write_text(out, encoding="utf-8")
print(f"rize_prototip.html {len(out.encode())/1024:.0f} KB")
