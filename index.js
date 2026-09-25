// index.js - Frontend JavaScript for SokoniMBS

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    // Backend API URL - Update this to match your server
    // For local development:
    const BACKEND_URL = 'http://localhost:3000';
    
    // For production (uncomment when deploying):
    // const BACKEND_URL = 'https://your-domain.com';
    
    console.log('🚀 SokoniMBS Frontend loaded');
    console.log(`📡 Backend URL: ${BACKEND_URL}`);

    // ============================================
    // ACCORDION TOGGLE
    // ============================================
    
    window.toggleAccordion = function(id) {
        const body = document.getElementById(id + 'Body');
        const arrow = document.getElementById(id + 'Arrow');
        
        if (!body || !arrow) {
            console.warn('Accordion elements not found for:', id);
            return;
        }

        const isOpen = body.classList.contains('open');

        // Close all other accordions
        document.querySelectorAll('.accordion-body').forEach(el => {
            if (el.id !== id + 'Body') {
                el.classList.remove('open');
                const otherArrow = document.getElementById(el.id.replace('Body', 'Arrow'));
                if (otherArrow) otherArrow.classList.remove('open');
            }
        });

        if (isOpen) {
            body.classList.remove('open');
            arrow.classList.remove('open');
        } else {
            body.classList.add('open');
            arrow.classList.add('open');
        }
    };

    // ============================================
    // SELL AIRTIME CALCULATOR
    // ============================================
    
    const airtimeInput = document.getElementById('airtimeAmount');
    const calculateBtn = document.getElementById('calculateCashbackBtn');
    const cashbackResult = document.getElementById('cashbackResult');
    const cashbackValue = document.getElementById('cashbackValue');
    const CASHBACK_RATE = 0.8;

    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            const amount = parseFloat(airtimeInput.value);
            if (!amount || amount < 1) {
                showToast('Please enter a valid airtime amount');
                cashbackResult.classList.remove('show');
                return;
            }
            const cashback = amount * CASHBACK_RATE;
            cashbackValue.textContent = 'Ksh ' + cashback.toFixed(0);
            cashbackResult.classList.add('show');
        });
    }

    if (airtimeInput) {
        airtimeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateBtn.click();
        });
    }

    // ============================================
    // PAYMENT MODAL LOGIC
    // ============================================
    
    const modal = document.getElementById('buyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalOptions = document.getElementById('modalOptions');
    const modalPhoneInput = document.getElementById('modalPhoneInput');
    const userPhoneInput = document.getElementById('userPhoneInput');
    const userAmountInput = document.getElementById('userAmountInput');
    const payNowError = document.getElementById('payNowError');
    const paymentStatus = document.getElementById('paymentStatus');
    const toast = document.getElementById('toast');

    let currentOffer = { title: '', price: 0 };

    // ============================================
    // BUY BUTTON HANDLERS
    // ============================================
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.dataset.title || 'Offer';
            const price = parseInt(this.dataset.price) || 0;
            currentOffer.title = title;
            currentOffer.price = price;
            openModal(title, price);
        });
    });

    // Discount airtime button
    const discountBtn = document.getElementById('discountAirtimeBtn');
    if (discountBtn) {
        discountBtn.addEventListener('click', function() {
            showToast('To buy airtime at 7% discount, contact +254704166953');
        });
    }

    // ============================================
    // MODAL FUNCTIONS
    // ============================================
    
    function openModal(title, price) {
        modalTitle.textContent = title;
        modalPrice.textContent = 'Ksh ' + price + '/-';
        modalOptions.style.display = 'block';
        modalPhoneInput.style.display = 'none';
        userPhoneInput.value = localStorage.getItem('userPhone') || '';
        userAmountInput.value = price;
        payNowError.textContent = '';
        paymentStatus.style.display = 'none';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close modal events
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', window.closeModal);
    }

    modal.addEventListener('click', function(e) {
        if (e.target === this) window.closeModal();
    });

    // Buy for Your Number button
    const buyForMeBtn = document.getElementById('buyForMeBtn');
    if (buyForMeBtn) {
        buyForMeBtn.addEventListener('click', function() {
            modalOptions.style.display = 'none';
            modalPhoneInput.style.display = 'block';
            userPhoneInput.focus();
            userAmountInput.value = currentOffer.price;
            payNowError.textContent = '';
            paymentStatus.style.display = 'none';
        });
    }

    // Buy for Another Number button
    const buyForOtherBtn = document.getElementById('buyForOtherBtn');
    if (buyForOtherBtn) {
        buyForOtherBtn.addEventListener('click', function() {
            window.location.href = 'https://bingwahybrid.com/a4cbdd0379';
            window.closeModal();
        });
    }

    // Back button
    const backToOptionsBtn = document.getElementById('backToOptionsBtn');
    if (backToOptionsBtn) {
        backToOptionsBtn.addEventListener('click', function() {
            modalPhoneInput.style.display = 'none';
            modalOptions.style.display = 'block';
            payNowError.textContent = '';
            paymentStatus.style.display = 'none';
        });
    }

    // ============================================
    // PAY NOW - M-PESA STK PUSH
    // ============================================
    
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', function() {
            const phone = userPhoneInput.value.trim();
            const amount = userAmountInput.value.trim();
            payNowError.textContent = '';
            paymentStatus.style.display = 'none';

            // Format phone number to 254XXXXXXXX
            let formattedPhone = phone;
            if (phone.startsWith('0')) {
                formattedPhone = '254' + phone.substring(1);
            } else if (!phone.startsWith('254')) {
                formattedPhone = '254' + phone;
            }

            // Validate phone number
            if (!/^(07|01)\d{8}$/.test(phone) && !/^254(7|1)\d{8}$/.test(formattedPhone)) {
                payNowError.textContent = 'Enter a valid Safaricom phone number (07XXXXXXXX)';
                return;
            }
            if (!amount || isNaN(amount) || Number(amount) < 1) {
                payNowError.textContent = 'Enter a valid amount';
                return;
            }

            // Show processing status
            paymentStatus.style.display = 'block';
            paymentStatus.className = 'payment-status pending';
            paymentStatus.textContent = '⏳ Processing payment...';

            // Send request to backend
            fetch(BACKEND_URL + '/stk-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: formattedPhone,
                    amount: Number(amount),
                    type: 'data',
                    offerName: currentOffer.title
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                
                if (data.success) {
                    paymentStatus.className = 'payment-status success';
                    paymentStatus.textContent = '✅ ' + data.message;
                    localStorage.setItem('userPhone', phone);
                    
                    // Show success with CheckoutRequestID if available
                    if (data.data && data.data.CheckoutRequestID) {
                        paymentStatus.textContent += '\n📱 Check your phone to complete payment';
                        // Store for potential status query
                        localStorage.setItem('checkoutRequestID', data.data.CheckoutRequestID);
                    }
                    
                    // Auto-close after success
                    setTimeout(function() { 
                        window.closeModal(); 
                    }, 5000);
                } else {
                    paymentStatus.className = 'payment-status failed';
                    paymentStatus.textContent = '❌ ' + (data.message || 'Payment failed. Please try again.');
                }
            })
            .catch(function(error) {
                console.error('Fetch error:', error);
                paymentStatus.className = 'payment-status failed';
                paymentStatus.textContent = '❌ Could not connect to payment server. Please ensure the backend is running.';
            });
        });
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    
    let toastTimeout;
    window.showToast = function(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
        }, 3500);
    };

    // ============================================
    // TRANSACTION HISTORY
    // ============================================
    
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            const phone = document.getElementById('historyPhoneInput').value.trim();
            if (!/^(07|01)\d{8}$/.test(phone)) {
                showToast('Enter a valid Safaricom phone number');
                return;
            }
            fetchHistory(phone);
        });
    }

    async function fetchHistory(phone) {
        const container = document.getElementById('transactionHistory');
        container.innerHTML = '<div class="text-small text-center" style="padding:16px 0;">Loading...</div>';

        try {
            const supabaseUrl = 'https://lyeypdcwsxbrjethaefj.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXlwZGN3c3hicmpldGhhZWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjQ4NTUsImV4cCI6MjA2NzY0MDg1NX0.DG8rvOYhdW8NEJWqG-Q-D_F0zMQWVZgPsBpCzQg2h78';
            
            // Dynamic import for Supabase
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('phone', phone)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div class="text-small text-center" style="padding:16px 0;">No transactions found.</div>';
                return;
            }

            let html = '';
            for (let i = 0; i < data.length; i++) {
                const tx = data[i];
                const statusClass = 'status-' + (tx.status || 'pending');
                html += `
                    <div class="history-item">
                        <div>
                            <div style="font-weight:600; font-size:0.9rem;">${tx.offer_name || 'Offer'}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${new Date(tx.created_at).toLocaleString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="amount">Ksh ${tx.amount}</div>
                            <span class="status ${statusClass}">${tx.status || 'pending'}</span>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;

        } catch (err) {
            container.innerHTML = '<div class="text-small text-center" style="padding:16px 0; color:#e31b23;">Failed to load history.</div>';
            console.warn('History fetch error:', err);
        }
    }

    // ============================================
    // AUTOFILL PHONE NUMBER
    // ============================================
    
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
        const historyInput = document.getElementById('historyPhoneInput');
        if (historyInput) historyInput.value = savedPhone;
        
        const modalPhoneInputField = document.getElementById('userPhoneInput');
        if (modalPhoneInputField) modalPhoneInputField.value = savedPhone;
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    
    document.addEventListener('keydown', function(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            window.closeModal();
        }
    });

    console.log('✅ SokoniMBS Frontend initialized successfully');
    console.log(`📡 Backend endpoint: ${BACKEND_URL}/stk-push`);
})();