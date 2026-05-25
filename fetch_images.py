import re
import json
import urllib.request
import urllib.parse
import time

def get_wiki_image(query):
    # Strip some generic terms to improve search
    search_term = query.replace("ready plant", "").replace("fruiting size", "").replace("ready", "").replace("fruiting", "").replace("extra big size thick stem", "").replace("medium size 6ft", "").replace("Big size, thick stem, bushy", "").strip()
    
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(search_term)}&prop=pageimages&format=json&pithumbsize=800"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            for page_id in pages:
                if page_id != '-1' and 'thumbnail' in pages[page_id]:
                    return pages[page_id]['thumbnail']['source']
    except Exception as e:
        print(f"Error fetching for {search_term}: {e}")
        
    # fallback search if direct title match fails
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_term)}&utf8=&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data['query']['search']:
                best_match = data['query']['search'][0]['title']
                img_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(best_match)}&prop=pageimages&format=json&pithumbsize=800"
                req2 = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req2) as resp2:
                    d2 = json.loads(resp2.read().decode())
                    p2 = d2['query']['pages']
                    for pid in p2:
                        if pid != '-1' and 'thumbnail' in p2[pid]:
                            return p2[pid]['thumbnail']['source']
    except Exception as e:
        pass
        
    return None

def main():
    with open('index.html', 'r') as f:
        content = f.read()

    pattern = re.compile(r'const products = (\[\s*\{.*?\}\s*\]);', re.DOTALL)
    match = pattern.search(content)

    if not match:
        print("Could not find products array!")
        return

    products_str = match.group(1)
    try:
        products = json.loads(products_str)
    except Exception as e:
        print("Error parsing JSON array:", e)
        return

    print(f"Found {len(products)} products. Fetching images...")

    fallback_images = [
        "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=800&h=800&fit=crop&q=80",
        "https://images.unsplash.com/photo-1596547609652-9cb5d8d87515?w=800&h=800&fit=crop&q=80",
        "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop&q=80"
    ]
    
    updated_count = 0
    for idx, p in enumerate(products):
        print(f"[{idx+1}/{len(products)}] Fetching for {p['name']}...")
        img = get_wiki_image(p['name'])
        if img:
            p['image'] = img
            updated_count += 1
            print(" -> Found:", img)
        else:
            p['image'] = fallback_images[idx % len(fallback_images)]
            print(" -> Fallback used.")
        time.sleep(0.1) # Be nice to Wikipedia API

    print(f"Finished. Found actual images for {updated_count}/{len(products)} plants.")

    new_js_array = "const products = " + json.dumps(products, indent=12) + ";"
    new_content = content[:match.start()] + new_js_array + content[match.end():]
    
    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Updated index.html successfully.")

if __name__ == "__main__":
    main()
