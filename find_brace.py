with open('index.html', 'r') as f:
    lines = f.readlines()

in_style = False
style_start = 0
for i, line in enumerate(lines):
    if '<style>' in line:
        in_style = True
        style_start = i
        break

if not in_style:
    exit(1)

stack = []
for i in range(style_start, len(lines)):
    line = lines[i]
    if '</style>' in line:
        break
    for char_pos, char in enumerate(line):
        if char == '{':
            stack.append((i+1, line.strip()))
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace at line {i+1}: {line.strip()}")

if stack:
    print(f"Unclosed braces found! The following {{ were never closed:")
    for line_num, content in stack:
        print(f"Line {line_num}: {content}")
