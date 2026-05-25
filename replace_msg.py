import os

files_to_process = [
    "karnataka-farms-premium.html",
    "karnataka-farms-mdp.html",
    "check.js"
]

replacement = """
            const cName = document.getElementById('co_name') ? document.getElementById('co_name').value : 'N/A';
            const cPhone = document.getElementById('co_phone') ? document.getElementById('co_phone').value : 'N/A';
            const cEmail = document.getElementById('co_email') ? document.getElementById('co_email').value : 'N/A';
            const cAddr1 = document.getElementById('co_addr1') ? document.getElementById('co_addr1').value : '';
            const cAddr2 = document.getElementById('co_addr2') ? document.getElementById('co_addr2').value : '';
            const cCity = document.getElementById('co_city') ? document.getElementById('co_city').value : '';
            const cLandmark = document.getElementById('co_landmark') ? document.getElementById('co_landmark').value : '';
            const cPin = document.getElementById('co_pin') ? document.getElementById('co_pin').value : '';
            const cState = document.getElementById('co_state') ? document.getElementById('co_state').value : '';
            
            const fullAddress = [cAddr1, cAddr2].filter(Boolean).join(', ');
            const cityStatePin = [cCity, cState, cPin].filter(Boolean).join(', ');
            
            const deliveryMethodEl = document.querySelector('input[name="delivery"]:checked');
            const deliveryMethod = deliveryMethodEl ? deliveryMethodEl.value : 'Home Delivery';
            
            const paymentMethodEl = document.querySelector('.payment-option.active .payment-label');
            const paymentMethod = paymentMethodEl ? paymentMethodEl.textContent : 'Cash on Delivery';

            let message = `[🛠️ TESTING]\\n\\n`;
            message += `*--- CUSTOMER DETAILS (For Courier) ---*\\n`;
            message += `Name: ${cName}\\n`;
            message += `Phone: ${cPhone}\\n`;
            message += `Email: ${cEmail}\\n`;
            message += `Address: ${fullAddress}\\n`;
            message += `City/State/PIN: ${cityStatePin}\\n`;
            if (cLandmark) message += `Landmark: ${cLandmark}\\n`;
            message += `Delivery Method: ${deliveryMethod}\\n\\n`;
            message += `----------------------------------------\\n\\n`;
            
            message += `*--- ORDER DETAILS (Order ID: ${orderId}) ---*\\n`;
"""

for filename in files_to_process:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace the first part
    target_start = "let message = `Hello! I would like to place an order (Order ID: ${orderId}):\\n\\n*Order Details:*\\n`;"
    content = content.replace(target_start, replacement)
    
    # 2. Replace the end part (this part differs slightly per file, but the text is identical!)
    target_end_premium = "message += `\\n*Summary:*\\nSubtotal: ₹${totalPrice.toLocaleString()}\\nDelivery: Free\\n*Total: ₹${total.toLocaleString()}*\\n\\nPlease let me know how to proceed with the payment and shipping!`;"
    target_end_mdp = "message += `\\n*Summary:*\\nSubtotal: ₹${totalPrice.toLocaleString()}\\nDelivery: Free\\n*Total: ₹${total.toLocaleString()}*\\n\\nPlease let me know how to proceed with the payment and shipping!`;"
    target_end_check = "message += `\\n*Summary:*\\nSubtotal: ₹${totalPrice.toLocaleString()}\\nDelivery: ${deliveryText}\\n*Total: ₹${total.toLocaleString()}*\\n\\nPlease let me know how to proceed with the payment and shipping!`;"
    
    new_end_free = """
            message += `\\n*Summary:*\\nSubtotal: ₹${totalPrice.toLocaleString()}\\nDelivery: Free\\n*Total: ₹${total.toLocaleString()}*\\n\\n`;
            message += `*--- PAYMENT ---*\\n`;
            message += `Preferred Payment: ${paymentMethod}\\n`;
            message += `Please share the QR code or payment instructions to complete this order.`;
"""
    new_end_check = """
            message += `\\n*Summary:*\\nSubtotal: ₹${totalPrice.toLocaleString()}\\nDelivery: ${deliveryText}\\n*Total: ₹${total.toLocaleString()}*\\n\\n`;
            message += `*--- PAYMENT ---*\\n`;
            message += `Preferred Payment: ${paymentMethod}\\n`;
            message += `Please share the QR code or payment instructions to complete this order.`;
"""

    if filename == "check.js":
        content = content.replace(target_end_check, new_end_check)
    else:
        content = content.replace(target_end_premium, new_end_free)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")
