import re
import sys

for file in ['karnataka-farms-premium.html', 'karnataka-farms-mdp.html']:
    try:
        with open(file, 'r') as f:
            html = f.read()
            style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
            if style_match:
                css = style_match.group(1)
                open_braces = css.count('{')
                close_braces = css.count('}')
                if open_braces != close_braces:
                    print(f"Mismatch in {file}: Open {open_braces}, Close {close_braces}")
                else:
                    print(f"OK in {file}")
    except Exception as e:
        pass
