import re

with open('index.html', 'r') as f:
    html = f.read()

style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    css = style_match.group(1)
    open_braces = css.count('{')
    close_braces = css.count('}')
    print(f"Open braces: {open_braces}, Close braces: {close_braces}")
else:
    print("No style block found")
