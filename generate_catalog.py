import re
import json

raw_ready = """
1	Rambhutan ready plant	3500
2	Mangosteen	3500
3	Red mango	2500
4	Kulumb mango	2500
5	Kalapady mango	1800
6	Banana Chicku	1500
7	Kalapathy chicku	1800
8	Thai king sapota	1800
9	Israyel orange qumquat	1200
10	Seedless lemon	1200
11	Starfruit	1500
12	Bear apple	1200
13	Jamoon black	1600
14	Abiue ready 6ft	2500
15	Abiue ready plant (Big size, thick stem, bushy)	16000
16	Hog plum sweet amte fruiting	1600
17	Bush orange fruiting	1500
18	Varegated bush orange fruiting	1200
19	Thai king black jamoon	2200
20	Market lemon	1200
21	Thaiwan pink guava	1600
22	Arka kiran guava	1600
23	Red diamond guava seedless	1800
24	Thai 7 guava	1600
25	Strawberry guava	1800
26	J33 jack ready	1800
27	Deang suriya jack	1800
28	Eviarc world’s sweetest jack ready	2500
29	Water apple Thailand red	1600
30	Rambhutan rongrein	2500
31	Rio grand cherry	1800
32	Mannilla tennis cherry	2200
33	Mangosteen fruiting	18000
34	Jaboticaba fruiting size	6500
35	Jaboticaba Red hybrid drum fruiting size	18000
36	4 kg mango ready	2500
37	American palmer mango	2500
38	Miyazaki mango ready plant	2500
39	Katimon mango ready plant	2200
40	Alupack ready plant	2800
41	Miracle fruit ready	1500
42	Pulasan ready plant	6500
43	Apoos mango ready	1800
44	Mallika mango ready	1800
45	R2E2 red mango ready	2500
46	White jamoon ready	1800
47	Barbados cherry ready	1500
48	Sweet lubi ready plant	2500
49	Lubi ready plant	1200
50	Milk fruit fruiting size	6500
51	Longon ready plant fruiting size	6500
52	Santhol fruiting	1800
53	Banana sapota ready XXL size	3200
54	Matoa ready	2500
55	Matoa ready in airpot big size XXL	6500
56	Pakistan mulberry ready	2200
57	Indian mulberry ready	1200
58	Coconut hybrid ready	1200
59	Red lemon ready Thailand	1600
60	Dragon fruit ready in drum	4600
61	Matoa ready plant 8ft thick stem	4500
62	Matoa medium size 6ft	2500
63	Eviarc jack ready	1800
64	Jaboticaba pot fruiting size	6500
65	Longon ready plant	6500
66	Kalapady ready plant	1800
67	Orange ready plant	3500
68	Musumbi ready plant	3500
69	Indian market lemon ready	2500
70	Seethphal ready	2500
71	Pomegranate ready	1800
72	Seethphal golden ready	3000
73	Seethaphal seedless ready	3500
74	Black jamoon extra big size thick stem	2800
75	Seedless jamoon Thailand special extra big size	3500
76	Thai king jamoon extra big size thick stem	3000
77	Mangosteen fruiting size 8 feet	12000
78	Litchi ready plant	2500
"""

raw_small = """
1	Sweet Lubi	850
2	Rainforest plum	950
3	Miracle fruit	350
4	Gramichama cherry	950
5	Keldeang	1400
6	Olosoph	950
7	Salak fruit	950
8	Alupack	950
9	Red Buttorfruit	750
10	Sweet Bush orange	450
11	Long mulberry	650
12	Brazilian mulberry	750
13	Thai king Jambha	650
14	Poochapazham	450
"""

images = [
    "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596547609652-9cb5d8d87515?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588612140409-5a585724bc2d?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1601646270634-118c7d540eb4?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528659551468-b3f02e86d267?w=800&h=800&fit=crop&q=80"
]

products = []
p_id = 0

def parse_lines(raw_text, category, category_slug):
    global p_id
    for line in raw_text.strip().split("\n"):
        parts = line.strip().split("\t")
        if len(parts) >= 3:
            name = parts[1].strip()
            price = int(parts[2].strip().replace(',',''))
            img = images[p_id % len(images)]
            products.append({
                "id": p_id,
                "name": name,
                "category": category,
                "categorySlug": category_slug,
                "price": price,
                "oldPrice": None,
                "rating": 4.9,
                "reviews": 24,
                "badge": "none",
                "badgeText": "",
                "image": img,
                "description": f"Premium nursery-grown {name}, acclimated and ready to thrive in your environment.",
                "sizes": ["Standard"],
                "pots": ["Nursery Pot"],
                "stock": 10,
                "care": [
                    "<strong>Light:</strong> Full to partial sun preferred for fruiting plants.",
                    "<strong>Water:</strong> Water deeply when top soil feels dry.",
                    "<strong>Care:</strong> Use organic compost monthly."
                ]
            })
            p_id += 1

parse_lines(raw_ready, "Ready Plants", "ready-plants")
parse_lines(raw_small, "Small Plants", "small-plants")

js_array = "const products = " + json.dumps(products, indent=12) + ";"

with open('index.html', 'r') as f:
    content = f.read()

pattern = re.compile(r'const products = \[\s*\{.*?\}\s*\];', re.DOTALL)
match = pattern.search(content)

if match:
    new_content = content[:match.start()] + js_array + content[match.end():]
    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Successfully updated products array in index.html")
else:
    print("Failed to find products array pattern!")
