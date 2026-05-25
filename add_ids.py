import os
import re

files_to_process = [
    "index.html",
    "karnataka-farms-premium.html",
    "karnataka-farms-mdp.html"
]

for filename in files_to_process:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace inputs to add IDs
    content = content.replace('<input type="text" placeholder="Rahul Kumar" required>', '<input type="text" id="co_name" placeholder="Rahul Kumar" required>')
    content = content.replace('<input type="tel" placeholder="+91 98765 43210" required pattern="[0-9+\s]{10,15}">', '<input type="tel" id="co_phone" placeholder="+91 98765 43210" required pattern="[0-9+\\s]{10,15}">')
    content = content.replace('<input type="email" placeholder="rahul@example.com" required>', '<input type="email" id="co_email" placeholder="rahul@example.com" required>')
    
    content = content.replace('<label style="display:flex;align-items:center;gap:8px;font-weight:400;"><input type="radio" name="delivery" checked> Home Delivery</label>', '<label style="display:flex;align-items:center;gap:8px;font-weight:400;"><input type="radio" name="delivery" value="Home Delivery" checked> Home Delivery</label>')
    content = content.replace('<label style="display:flex;align-items:center;gap:8px;font-weight:400;"><input type="radio" name="delivery"> Nursery Pickup</label>', '<label style="display:flex;align-items:center;gap:8px;font-weight:400;"><input type="radio" name="delivery" value="Nursery Pickup"> Nursery Pickup</label>')
    
    content = content.replace('<input type="text" placeholder="42, Green Valley Apartments" required>', '<input type="text" id="co_addr1" placeholder="42, Green Valley Apartments" required>')
    content = content.replace('<input type="text" placeholder="Near Silk Board Junction">', '<input type="text" id="co_addr2" placeholder="Near Silk Board Junction">')
    content = content.replace('<input type="text" placeholder="Bangalore" required>', '<input type="text" id="co_city" placeholder="Bangalore" required>')
    content = content.replace('<input type="text" placeholder="e.g. Opposite Metro Station">', '<input type="text" id="co_landmark" placeholder="e.g. Opposite Metro Station">')
    content = content.replace('<input type="text" placeholder="560001" required pattern="[0-9]{6}">', '<input type="text" id="co_pin" placeholder="560001" required pattern="[0-9]{6}">')
    content = content.replace('<select required><option value="">Select State</option>', '<select id="co_state" required><option value="">Select State</option>')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")
