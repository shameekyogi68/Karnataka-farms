import os
import re

def update_place_order(content):
    # Find the placeOrder function start and end
    # We will replace everything from `let message =` or `cart.forEach` up to `window.open`
    
    # We need to construct the new message logic.
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

            let message = `[🛠️ TESTING]\n\n`;
            message += `*--- CUSTOMER DETAILS (For Courier) ---*\n`;
            message += `Name: ${cName}\n`;
            message += `Phone: ${cPhone}\n`;
            message += `Email: ${cEmail}\n`;
            message += `Address: ${fullAddress}\n`;
            message += `City/State/PIN: ${cityStatePin}\n`;
            if (cLandmark) message += `Landmark: ${cLandmark}\n`;
            message += `Delivery Method: ${deliveryMethod}\n\n`;
            
            message += `*--- ORDER DETAILS (Order ID: ${orderId}) ---*\n`;
            
            cart.forEach(item => {
                message += `🌿 ${item.qty}x ${item.name} (${item.size}, ${item.pot}) - ₹${(item.price * item.qty).toLocaleString()}\n`;
                
                if (typeof db !== 'undefined' && db.userPlants) {
                    db.userPlants.push({
                        id: 'pl-' + Math.random().toString(36).substr(2,9),
                        name: item.name, image: item.image,
                        nextWater: new Date(Date.now() + 86400000 * 3).toISOString()
                    });
                }
            });
            
            if (typeof db !== 'undefined' && db.userPlants) {
                localStorage.setItem('kf_garden', JSON.stringify(db.userPlants));
            }
            
            const deliveryCharge = (typeof hasReadyPlants !== 'undefined' && hasReadyPlants || cart.length === 0) ? 0 : 80;
            const deliveryText = deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`;
            
            message += `\n*Summary:*\nSubtotal: ₹${totalPrice.toLocaleString()}\nDelivery: ${deliveryText}\n*Total: ₹${total.toLocaleString()}*\n\n`;
            message += `*--- PAYMENT ---*\n`;
            message += `Preferred Payment: ${paymentMethod}\n`;
            message += `Please share the QR code or payment instructions to complete this order.`;

            const whatsappUrl = `https://wa.me/917760674510?text=${encodeURIComponent(message)}`;
"""
    
    # We will use regex to replace the old message construction block.
    # Old block typically starts with `let message = ` and ends before `const whatsappUrl = `
    
    pattern1 = r'(?:let\s+message\s*=\s*`Hello!.*?)(?=const\s+whatsappUrl)'
    pattern2 = r'(?:let\s+message\s*=\s*`Hello!.*?)(?=db\.points)'
    
    # Actually, simpler is to just replace the specific sections manually or using a targeted regex
    # In index.html, check.js etc.
    # Let's replace the whole `placeOrder` function for safety? It's slightly different in mdp (db logic).
    
    pass

# We will just write a specific replacement script instead of complex regex
