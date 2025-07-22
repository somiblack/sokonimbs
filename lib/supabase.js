<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SokoniMbs - Buy Bundles & Airtime ChapChap!</title>
  <meta name="description" content="Buy affordable Safaricom bundles, airtime, and sell Bonga points instantly with STK Push at SokoniMbs. Fast, simple, reliable." />
  <meta name="keywords" content="SokoniMbs, Safaricom bundles, Kenya, data deals, internet packages, airtime, Bonga points" />
  <meta name="author" content="SokoniMbs Team" />
  <link rel="icon" href="favicon.ico" />
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2310b981;stop-opacity:0.1"/><stop offset="100%" style="stop-color:%233b82f6;stop-opacity:0.1"/></linearGradient></defs><rect width="400" height="400" fill="url(%23bg)"/><circle cx="100" cy="100" r="60" fill="%2310b981" opacity="0.1"/><circle cx="300" cy="150" r="40" fill="%233b82f6" opacity="0.1"/><circle cx="200" cy="300" r="80" fill="%236366f1" opacity="0.1"/><path d="M50,200 Q150,100 250,200 T450,200" stroke="%2310b981" stroke-width="2" fill="none" opacity="0.2"/></svg>') center/cover;
      z-index: -1;
    }

    .bundle-card {
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .bundle-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .data-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
    }

    .data-card:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
    }

    .renewable-card {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
    }

    .renewable-card:hover {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
    }

    .monthly-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(124, 58, 237, 0.9));
    }

    .monthly-card:hover {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95));
    }

    .minutes-card {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.9));
    }

    .minutes-card:hover {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(219, 39, 119, 0.95));
    }

    .sms-card {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(147, 51, 234, 0.9));
    }

    .sms-card:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(147, 51, 234, 0.95));
    }

    .airtime-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
    }

    .airtime-card:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
    }

    .bonga-card {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
    }

    .bonga-card:hover {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
    }
    
    .whatsapp-float {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #25D366;
      color: white;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .whatsapp-float:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
    }

    .header-glass {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .icon-small {
      width: 16px;
      height: 16px;
      display: inline-block;
      margin-right: 6px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .btn-manual {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      transition: all 0.3s ease;
    }
    
    .btn-manual:hover {
      background: linear-gradient(135deg, #d97706, #b45309);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      margin-right: 0.25rem;
    }

    .badge-save {
      background-color: rgba(239, 68, 68, 0.9);
      color: white;
    }

    .badge-renewable {
      background-color: rgba(34, 197, 94, 0.9);
      color: white;
    }

    /* Popup Modal Styles */
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .popup-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .popup-bubble {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: 20px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      transform: scale(0.8) translateY(20px);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .popup-overlay.active .popup-bubble {
      transform: scale(1) translateY(0);
    }

    .popup-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .popup-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .popup-subtitle {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .popup-content {
      margin-bottom: 1.5rem;
    }

    .popup-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .popup-input:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .popup-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }

    .popup-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 0.9rem;
    }

    .popup-btn-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .popup-btn-primary:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }

    .popup-btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .popup-btn-secondary:hover {
      background: #e5e7eb;
      transform: translateY(-2px);
    }

    .popup-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .popup-price {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 1rem;
    }

    .popup-toggle {
      display: flex;
      background: #f3f4f6;
      border-radius: 10px;
      padding: 0.25rem;
      margin-bottom: 1rem;
    }

    .popup-toggle-btn {
      flex: 1;
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .popup-toggle-btn.active {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      color: #10b981;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      text-align: center;
    }

    .success-message {
      color: #10b981;
      font-size: 0.9rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    /* Transaction History Styles */
    .transaction-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .transaction-card:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-success {
      background-color: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-pending {
      background-color: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-failed {
      background-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .transaction-amount {
      font-size: 1.25rem;
      font-weight: bold;
      color: #10b981;
    }

    .transaction-meta {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .show-history-btn {
      position: fixed;
    }
  </style>
</head>
<body class="font-sans text-gray-900">

  <!-- Header -->
  <header class="header-glass text-white p-4 shadow-lg sticky top-0 z-50">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-lg font-bold text-left">SokoniMbs.co.ke</h1>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8 sm:px-6">
    <section class="text-center mb-12">
      <h2 class="text-4xl font-bold text-white mb-4">Available Offers</h2>
      <p class="text-white/80 text-lg">Affordable & Instant Safaricom Bundles, Airtime & More</p>
    </section>

    <!-- Data Bundles -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        Data Bundles
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="data-offers"></div>
    </section>

    <!-- Renewable Data Offers -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
        </svg>
        Renewable Data Offers
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="renewable-offers"></div>
    </section>

    <!-- Monthly Packages -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
        </svg>
        Monthly Packages
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="monthly-offers"></div>
    </section>

    <!-- Minutes & Talktime -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
        </svg>
        Minutes & Talktime ☎️
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="minutes-offers"></div>
    </section>

    <!-- SMS Bundle Offers -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
        </svg>
        SMS Bundle Offers 📱
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="sms-offers"></div>
    </section>

    <!-- Airtime -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
        </svg>
        Discounted Airtime
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="airtime-offers"></div>
    </section>

    <!-- Bonga Points -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
        </svg>
        Sell Bonga Points
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="bonga-offers"></div>
    </section>

    <!-- Transaction History -->
    <section class="mb-12" id="historySection" style="display: none;">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        Transaction History
        <button id="refreshHistoryBtn" class="ml-4 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all">
          Refresh
        </button>
      </h3>
      
      <div class="mb-4">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="tel" 
            id="historyPhoneInput" 
            placeholder="Enter phone number (07XXXXXXXX)" 
            class="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            id="loadHistoryBtn" 
            class="btn-primary text-white px-6 py-2 rounded-lg font-medium whitespace-nowrap"
          >
            Load History
          </button>
        </div>
      </div>
      
      <div id="historyLoading" class="text-center text-white/80 py-8" style="display: none;">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="mt-2">Loading transaction history...</p>
      </div>
      
      <div id="historyError" class="text-center text-red-300 py-8" style="display: none;">
        <p id="historyErrorMessage">Failed to load transaction history</p>
      </div>
      
      <div id="historyEmpty" class="text-center text-white/60 py-8" style="display: none;">
        <svg class="mx-auto h-12 w-12 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <p>No transactions found for this number</p>
      </div>
      
      <div id="historyContent" class="space-y-4" style="display: none;"></div>
    </section>
    <!-- Transaction History -->
    <section class="mb-12">
      <h3 class="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd"/>
        </svg>
        Transaction History
      </h3>
      
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="mb-4">
          <input 
            type="tel" 
            id="historyPhone" 
            placeholder="Enter your phone number (07XXXXXXXX)" 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button 
            id="loadHistoryBtn" 
            class="mt-3 btn-primary text-white px-6 py-2 rounded-lg font-medium"
          >
            Load Transaction History
          </button>
        </div>
        
        <div id="historyLoading" class="text-center text-white/70 py-8" style="display: none;">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="mt-2">Loading your transaction history...</p>
        </div>
        
        <div id="historyError" class="text-center text-red-400 py-4" style="display: none;"></div>
        
        <div id="historyEmpty" class="text-center text-white/70 py-8" style="display: none;">
          <svg class="mx-auto h-12 w-12 text-white/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No transactions found for this phone number.</p>
          <p class="text-sm mt-2">Your transaction history will appear here after making purchases.</p>
        </div>
        
        <div id="historyContent" class="space-y-4" style="display: none;">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-white">Recent Transactions</h4>
            <span id="historyCount" class="text-sm text-white/70"></span>
          </div>
          <div id="historyList" class="space-y-3"></div>
        </div>
      </div>
    </section>

    <!-- Notices -->
    <section class="space-y-4">
      <div class="p-4 text-sm text-red-800 bg-yellow-100/90 backdrop-blur-sm rounded-lg shadow-lg text-center border border-yellow-200">
        <strong>Important:</strong> Only one bundle per day. A new day starts at <strong>midnight</strong>.
      </div>
      <div class="p-4 text-sm text-green-800 bg-green-100/90 backdrop-blur-sm rounded-lg shadow-lg text-center border border-green-200">
        <strong>Manual Payment:</strong> Till Number: <strong>4288958</strong><br>
        Recipient: <strong>SokoniMbs</strong>
      </div>
      <div class="p-4 text-sm text-orange-800 bg-orange-100/90 backdrop-blur-sm rounded-lg shadow-lg text-center border border-orange-200">
        <strong>Minutes & Talktime Manual Payment:</strong> Send to <strong>0112223307</strong><br>
        <em>Automation coming soon!</em>
      </div>
      <div class="p-4 text-sm text-blue-800 bg-blue-100/90 backdrop-blur-sm rounded-lg shadow-lg text-center border border-blue-200">
        More deals on <a href="https://sokonimbs.co.ke/" class="underline font-semibold text-blue-900 hover:text-blue-700" target="_blank">SokoniMbs.co.ke</a>
      </div>
    </section>
  </main>

  <!-- WhatsApp Shortcut -->
  <a href="https://wa.me/254704166953" class="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
    <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  </a>

  <!-- Purchase Popup Modal -->
  <div id="purchasePopup" class="popup-overlay">
    <div class="popup-bubble">
      <div class="popup-header">
        <div class="popup-title" id="popupTitle">Purchase Bundle</div>
        <div class="popup-subtitle" id="popupSubtitle">Complete your purchase</div>
      </div>
      
      <div class="popup-content">
        <div class="popup-price" id="popupPrice">Ksh 0</div>
        
        <div class="popup-toggle" id="purchaseToggle">
          <button class="popup-toggle-btn active" data-mode="self">For Me</button>
          <button class="popup-toggle-btn" data-mode="other">For Another</button>
        </div>
        
        <div id="phoneInputs">
          <input type="tel" class="popup-input" id="payerPhone" placeholder="Your Safaricom number (07XXXXXXXX)" />
          <input type="tel" class="popup-input" id="recipientPhone" placeholder="Recipient's number (07XXXXXXXX)" style="display: none;" />
        </div>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
        <div id="successMessage" class="success-message" style="display: none;"></div>
      </div>
      
      <div class="popup-actions">
        <button class="popup-btn popup-btn-secondary" id="cancelBtn">Cancel</button>
        <button class="popup-btn popup-btn-primary" id="confirmBtn">
          <span id="confirmText">Confirm Purchase</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Bonga Points Popup Modal -->
  <div id="bongaPopup" class="popup-overlay">
    <div class="popup-bubble">
      <div class="popup-header">
        <div class="popup-title">Sell Bonga Points</div>
        <div class="popup-subtitle">Convert your points to cash</div>
      </div>
      
      <div class="popup-content">
        <select class="popup-input" id="bongaAmount">
          <option value="">Select amount</option>
          <option value="1000">1000 Points - Ksh 200</option>
          <option value="2000">2000 Points - Ksh 400</option>
          <option value="3000">3000 Points - Ksh 600</option>
          <option value="5000">5000 Points - Ksh 1000</option>
        </select>
        
        <input type="tel" class="popup-input" id="bongaPhone" placeholder="Your Safaricom number (07XXXXXXXX)" />
        
        <div id="bongaErrorMessage" class="error-message" style="display: none;"></div>
        <div id="bongaSuccessMessage" class="success-message" style="display: none;"></div>
      </div>
      
      <div class="popup-actions">
        <button class="popup-btn popup-btn-secondary" id="bongaCancelBtn">Cancel</button>
        <button class="popup-btn popup-btn-primary" id="bongaConfirmBtn" disabled>
          <span id="bongaConfirmText">Sell Points</span>
        </button>
      </div>
    </div>
  </div>

  <!-- JavaScript -->
  <script>
    const dataOffers = [
      { name: "1.25GB till Midnight", price: 55 },
      { name: "350MB - Weekly", price: 49 },
      { name: "1GB - 1 Hour", price: 19 },
      { name: "250MB - 24 Hours", price: 20 },
      { name: "1GB - 24 Hours", price: 99 },
      { name: "2.5GB - 7 Days", price: 300 },
      { name: "6GB - 7 Days", price: 700 }
    ];

    const renewableOffers = [
      { name: "2GB - 24 hours", price: 110, originalPrice: 138, discount: 20, badges: ["Save 20%", "Renewable"] },
      { name: "1.5GB - 3 hours", price: 51, badges: ["Renewable"] },
      { name: "1GB - 1 hour", price: 21, badges: ["Renewable"] }
    ];

    const monthlyOffers = [
      { name: "1.2GB - 30 Days", price: 250 },
      { name: "2.5GB - 30 Days", price: 500 },
      { name: "10GB - 30 Days", price: 1001 },
      { name: "8GB + 400 Min - 30 Days", price: 1000 },
      { name: "300 Min - 30 Days", price: 500 }
    ];

    const minutesOffers = [
      { name: "45 minutes (3 hours)", price: 22, isManual: true },
      { name: "200 Bob credit (till midnight)", price: 52, isManual: true },
      { name: "250 minutes (7 days)", price: 200, isManual: true },
      { name: "1250 minutes (30 days)", price: 1000, isManual: true }
    ];

    const smsOffers = [
      { name: "20 SMS (24 hours)", price: 5 },
      { name: "200 SMS (24 hours)", price: 10 },
      { name: "1000 SMS (weekly)", price: 30 },
      { name: "1500 SMS (monthly)", price: 100 },
      { name: "3500 SMS (monthly)", price: 200 }
    ];

    const airtimeOffers = [
      { name: "Ksh 100 Airtime", originalPrice: 100, price: 95, discount: 5 },
      { name: "Ksh 200 Airtime", originalPrice: 200, price: 190, discount: 5 },
      { name: "Ksh 500 Airtime", originalPrice: 500, price: 475, discount: 5 },
      { name: "Ksh 1000 Airtime", originalPrice: 1000, price: 950, discount: 5 }
    ];

    const bongaOffers = [
      { name: "1000 Bonga Points", price: 200, description: "Sell your Bonga points instantly" }
    ];

    // Popup functionality
    let currentOffer = null;
    let currentType = null;

    function showPurchasePopup(offer, type, isOther = false) {
      currentOffer = offer;
      currentType = type;
      
      const popup = document.getElementById('purchasePopup');
      const title = document.getElementById('popupTitle');
      const subtitle = document.getElementById('popupSubtitle');
      const price = document.getElementById('popupPrice');
      const toggle = document.getElementById('purchaseToggle');
      
      title.textContent = offer.name;
      
      if (type === 'airtime') {
        subtitle.textContent = `${offer.discount}% OFF - Save Ksh ${offer.originalPrice - offer.price}`;
        price.innerHTML = `
          <span style="text-decoration: line-through; opacity: 0.7; font-size: 0.8em;">Ksh ${offer.originalPrice}</span>
          <span style="margin-left: 8px;">Ksh ${offer.price}</span>
        `;
      } else if (type === 'renewable' && offer.originalPrice) {
        subtitle.textContent = `${offer.discount}% OFF - Save Ksh ${offer.originalPrice - offer.price}`;
        price.innerHTML = `
          <span style="text-decoration: line-through; opacity: 0.7; font-size: 0.8em;">Ksh ${offer.originalPrice}</span>
          <span style="margin-left: 8px;">Ksh ${offer.price}</span>
        `;
      } else {
        subtitle.textContent = 'Complete your purchase';
        price.textContent = `Ksh ${offer.price}`;
      }
      
      // Set initial mode
      const selfBtn = toggle.querySelector('[data-mode="self"]');
      const otherBtn = toggle.querySelector('[data-mode="other"]');
      
      if (isOther) {
        selfBtn.classList.remove('active');
        otherBtn.classList.add('active');
        togglePurchaseMode('other');
      } else {
        selfBtn.classList.add('active');
        otherBtn.classList.remove('active');
        togglePurchaseMode('self');
      }
      
      clearMessages();
      popup.classList.add('active');
    }

    function showBongaPopup() {
      const popup = document.getElementById('bongaPopup');
      clearBongaMessages();
      popup.classList.add('active');
    }

    function hidePurchasePopup() {
      document.getElementById('purchasePopup').classList.remove('active');
      clearInputs();
    }

    function hideBongaPopup() {
      document.getElementById('bongaPopup').classList.remove('active');
      clearBongaInputs();
    }

    function togglePurchaseMode(mode) {
      const recipientPhone = document.getElementById('recipientPhone');
      const payerPhone = document.getElementById('payerPhone');
      
      if (mode === 'other') {
        recipientPhone.style.display = 'block';
        payerPhone.placeholder = 'Your number (for payment)';
      } else {
        recipientPhone.style.display = 'none';
        payerPhone.placeholder = 'Your Safaricom number (07XXXXXXXX)';
      }
      
      clearMessages();
    }

    function validatePhone(phone) {
      return /^(?:\+254|254|0)(7|1)[0-9]{8}$/.test(phone);
    }

    function showError(message) {
      const errorDiv = document.getElementById('errorMessage');
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }

    function showSuccess(message) {
      const successDiv = document.getElementById('successMessage');
      successDiv.textContent = message;
      successDiv.style.display = 'block';
    }

    function showBongaError(message) {
      const errorDiv = document.getElementById('bongaErrorMessage');
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }

    function showBongaSuccess(message) {
      const successDiv = document.getElementById('bongaSuccessMessage');
      successDiv.textContent = message;
      successDiv.style.display = 'block';
    }

    function clearMessages() {
      document.getElementById('errorMessage').style.display = 'none';
      document.getElementById('successMessage').style.display = 'none';
    }

    function clearBongaMessages() {
      document.getElementById('bongaErrorMessage').style.display = 'none';
      document.getElementById('bongaSuccessMessage').style.display = 'none';
    }

    function clearInputs() {
      document.getElementById('payerPhone').value = '';
      document.getElementById('recipientPhone').value = '';
      clearMessages();
    }

    function clearBongaInputs() {
      document.getElementById('bongaAmount').value = '';
      document.getElementById('bongaPhone').value = '';
      document.getElementById('bongaConfirmBtn').disabled = true;
      document.getElementById('bongaConfirmText').textContent = 'Sell Points';
      clearBongaMessages();
    }

    // Event listeners
    document.getElementById('purchaseToggle').addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-toggle-btn')) {
        const mode = e.target.dataset.mode;
        const buttons = document.querySelectorAll('.popup-toggle-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        togglePurchaseMode(mode);
      }
    });

    document.getElementById('cancelBtn').addEventListener('click', hidePurchasePopup);
    document.getElementById('bongaCancelBtn').addEventListener('click', hideBongaPopup);

    // Close popup when clicking overlay
    document.getElementById('purchasePopup').addEventListener('click', (e) => {
      if (e.target.id === 'purchasePopup') hidePurchasePopup();
    });

    document.getElementById('bongaPopup').addEventListener('click', (e) => {
      if (e.target.id === 'bongaPopup') hideBongaPopup();
    });

    // Bonga amount selection
    document.getElementById('bongaAmount').addEventListener('change', function() {
      const confirmBtn = document.getElementById('bongaConfirmBtn');
      const confirmText = document.getElementById('bongaConfirmText');
      
      if (this.value) {
        confirmBtn.disabled = false;
        confirmText.textContent = `Sell ${this.value} Points`;
      } else {
        confirmBtn.disabled = true;
        confirmText.textContent = 'Sell Points';
      }
    });

    // Confirm purchase
    document.getElementById('confirmBtn').addEventListener('click', async () => {
      const payerPhone = document.getElementById('payerPhone').value.trim();
      const recipientPhone = document.getElementById('recipientPhone').value.trim();
      const isOtherMode = document.querySelector('[data-mode="other"]').classList.contains('active');
      
      if (!validatePhone(payerPhone)) {
        showError('Please enter a valid Safaricom number (07XXXXXXXX or +2547XXXXXXXX)');
        return;
      }
      
      if (isOtherMode && !validatePhone(recipientPhone)) {
        showError('Please enter a valid recipient number');
        return;
      }
      
      const confirmBtn = document.getElementById('confirmBtn');
      const confirmText = document.getElementById('confirmText');
      
      confirmBtn.disabled = true;
      confirmText.textContent = 'Processing...';
      
      try {
        const requestData = {
          phone: payerPhone,
          amount: parseInt(currentOffer.price),
          type: currentType,
          offerName: currentOffer.name,
          recipientPhone: isOtherMode ? recipientPhone : undefined
        };

        if (currentType === 'airtime') {
          requestData.originalAmount = parseInt(currentOffer.originalPrice);
          requestData.discount = parseInt(currentOffer.discount);
        }

        if (currentType === 'renewable' && currentOffer.originalPrice) {
          requestData.originalAmount = parseInt(currentOffer.originalPrice);
          requestData.discount = parseInt(currentOffer.discount);
        }

        const res = await fetch("/stk-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData)
        });
        
        const data = await res.json();
        
        if (data.ResponseCode === '0') {
          showSuccess('Payment request sent to your phone. Please complete the payment.');
          setTimeout(() => {
            hidePurchasePopup();
          }, 3000);
        } else {
          showError(data.ResponseDescription || 'Payment request failed. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        showError('There was an error processing your request. Please try again.');
      } finally {
        confirmBtn.disabled = false;
        confirmText.textContent = 'Confirm Purchase';
      }
    });

    // Confirm Bonga sale
    document.getElementById('bongaConfirmBtn').addEventListener('click', async () => {
      const points = document.getElementById('bongaAmount').value;
      const phone = document.getElementById('bongaPhone').value.trim();
      
      if (!points) {
        showBongaError('Please select the amount of Bonga points to sell');
        return;
      }
      
      if (!validatePhone(phone)) {
        showBongaError('Please enter a valid Safaricom number');
        return;
      }
      
      const price = (parseInt(points) / 1000) * 200;
      const confirmBtn = document.getElementById('bongaConfirmBtn');
      const confirmText = document.getElementById('bongaConfirmText');
      
      confirmBtn.disabled = true;
      confirmText.textContent = 'Processing...';
      
      try {
        const res = await fetch("/stk-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            amount: price,
            type: 'bonga',
            offerName: `${points} Bonga Points`,
            points: points
          })
        });
        
        const data = await res.json();
        
        if (data.ResponseCode === '0') {
          showBongaSuccess(`Payment request sent! You will receive Ksh ${price} for ${points} Bonga points.`);
          setTimeout(() => {
            hideBongaPopup();
          }, 3000);
        } else {
          showBongaError(data.ResponseDescription || 'Request failed. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        showBongaError('There was an error processing your request. Please try again.');
      } finally {
        confirmBtn.disabled = false;
        confirmText.textContent = `Sell ${points} Points`;
      }
    });

    function renderOffers(offers, containerId, type = 'data') {
      const container = document.getElementById(containerId);
      offers.forEach(offer => {
        const card = document.createElement("div");
        
        let cardClass = "bundle-card rounded-xl p-6 shadow-lg text-center text-white";
        if (type === 'data') cardClass += " data-card";
        else if (type === 'renewable') cardClass += " renewable-card";
        else if (type === 'monthly') cardClass += " monthly-card";
        else if (type === 'minutes') cardClass += " minutes-card";
        else if (type === 'sms') cardClass += " sms-card";
        else if (type === 'airtime') cardClass += " airtime-card";
        else if (type === 'bonga') cardClass += " bonga-card";
        
        card.className = cardClass;
        
        let cardContent = '';
        
        // Add badges for renewable offers
        if (type === 'renewable' && offer.badges) {
          cardContent += '<div class="mb-3">';
          offer.badges.forEach(badge => {
            const badgeClass = badge.includes('Save') ? 'badge badge-save' : 'badge badge-renewable';
            cardContent += `<span class="${badgeClass}">${badge}</span>`;
          });
          cardContent += '</div>';
        }
        
        if (type === 'airtime') {
          cardContent += `
            <h3 class="text-lg font-bold mb-2">${offer.name}</h3>
            <div class="mb-3">
              <span class="text-sm text-white/70 line-through">Ksh ${offer.originalPrice}</span>
              <span class="text-xl font-bold ml-2">Ksh ${offer.price}</span>
              <span class="text-sm text-white/90 block">${offer.discount}% OFF</span>
            </div>
          `;
        } else if (type === 'renewable' && offer.originalPrice) {
          cardContent += `
            <h3 class="text-lg font-bold mb-2">${offer.name}</h3>
            <div class="mb-3">
              <span class="text-sm text-white/70 line-through">Ksh ${offer.originalPrice}</span>
              <span class="text-xl font-bold ml-2">Ksh ${offer.price}</span>
              <span class="text-sm text-white/90 block">${offer.discount}% OFF</span>
            </div>
          `;
        } else if (type === 'bonga') {
          cardContent += `
            <h3 class="text-lg font-bold mb-2">${offer.name}</h3>
            <p class="text-xl font-bold mb-2">Ksh ${offer.price}</p>
            <p class="text-sm text-white/80 mb-3">${offer.description}</p>
          `;
        } else {
          cardContent += `
            <h3 class="text-lg font-bold mb-2">${offer.name}</h3>
            <p class="text-xl font-bold mb-3">Ksh ${offer.price}</p>
          `;
        }
        
        if (type !== 'bonga') {
          if (type === 'minutes' && offer.isManual) {
            cardContent += `
              <div class="space-y-2">
                <button class="btn-manual text-white px-4 py-2 rounded-lg w-full font-medium" 
                        onclick="alert('Send Ksh ${offer.price} to 0112223307 for ${offer.name}')">
                  Manual Payment
                </button>
                <p class="text-xs text-white/70">Send to 0112223307</p>
              </div>
            `;
          } else {
            cardContent += `
              <div class="space-y-2">
                <button class="btn-primary text-white px-4 py-2 rounded-lg w-full buy-btn font-medium" 
                        data-bundle="${offer.name}" 
                        data-price="${offer.price}" 
                        ${type === 'airtime' ? `data-original="${offer.originalPrice}" data-discount="${offer.discount}"` : ''}
                        ${type === 'renewable' && offer.originalPrice ? `data-original="${offer.originalPrice}" data-discount="${offer.discount}"` : ''}
                        data-type="${type}">
                  Buy Now
                </button>
                <button class="btn-secondary text-white px-4 py-2 rounded-lg w-full buy-other-btn font-medium" 
                        data-bundle="${offer.name}" 
                        data-price="${offer.price}"
                        ${type === 'airtime' ? `data-original="${offer.originalPrice}" data-discount="${offer.discount}"` : ''}
                        ${type === 'renewable' && offer.originalPrice ? `data-original="${offer.originalPrice}" data-discount="${offer.discount}"` : ''}
                        data-type="${type}">
                  Buy for Another
                </button>
              </div>
            `;
          }
        } else {
          cardContent += `
            <div class="space-y-2">
              <button class="btn-primary text-white px-4 py-2 rounded-lg w-full sell-bonga-btn font-medium">
                Sell Points
              </button>
            </div>
          `;
        }
        
        card.innerHTML = cardContent;
        container.appendChild(card);
      });

      // Add event listeners for regular buy buttons
      container.querySelectorAll('.buy-btn, .buy-other-btn').forEach(button => {
        button.addEventListener('click', () => {
          const bundle = button.dataset.bundle;
          const price = button.dataset.price;
          const type = button.dataset.type;
          const isOther = button.classList.contains('buy-other-btn');
          
          const offer = {
            name: bundle,
            price: parseInt(price)
          };
          
          if (type === 'airtime' || (type === 'renewable' && button.dataset.original)) {
            offer.originalPrice = parseInt(button.dataset.original);
            offer.discount = parseInt(button.dataset.discount);
          }
          
          showPurchasePopup(offer, type, isOther);
        });
      });

      // Add event listeners for Bonga points
      container.querySelectorAll('.sell-bonga-btn').forEach(button => {
        button.addEventListener('click', () => {
          showBongaPopup();
        });
      });
    }

    // Transaction History functionality
    function loadTransactionHistory() {
      const phone = document.getElementById('historyPhone').value.trim();
      const loadingDiv = document.getElementById('historyLoading');
      const errorDiv = document.getElementById('historyError');
      const emptyDiv = document.getElementById('historyEmpty');
      const contentDiv = document.getElementById('historyContent');
      
      if (!validatePhone(phone)) {
        showHistoryError('Please enter a valid Safaricom number (07XXXXXXXX or +2547XXXXXXXX)');
        return;
      }
      
      // Show loading state
      hideAllHistoryStates();
      loadingDiv.style.display = 'block';
      
      // Format phone number for API call
      const formattedPhone = formatPhoneForApi(phone);
      
      fetch(`/api/transactions/${formattedPhone}`)
        .then(response => response.json())
        .then(data => {
          hideAllHistoryStates();
          
          if (data.success && data.transactions && data.transactions.length > 0) {
            displayTransactionHistory(data.transactions);
          } else {
            emptyDiv.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error loading transaction history:', error);
          showHistoryError('Failed to load transaction history. Please try again.');
        });
    }
    
    function formatPhoneForApi(phone) {
      // Remove any spaces, dashes, or other non-numeric characters except +
      const cleaned = phone.replace(/[^\d+]/g, '');
      
      // Handle different formats
      if (cleaned.startsWith('254')) {
        return cleaned;
      } else if (cleaned.startsWith('+254')) {
        return cleaned.slice(1);
      } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '254' + cleaned.slice(1);
      } else if (cleaned.startsWith('7') && cleaned.length === 9) {
        return '254' + cleaned;
      }
      
      return cleaned;
    }
    
    function hideAllHistoryStates() {
      document.getElementById('historyLoading').style.display = 'none';
      document.getElementById('historyError').style.display = 'none';
      document.getElementById('historyEmpty').style.display = 'none';
      document.getElementById('historyContent').style.display = 'none';
    }
    
    function showHistoryError(message) {
      hideAllHistoryStates();
      const errorDiv = document.getElementById('historyError');
      errorDiv.textContent = message;
      const loadBtn = document.getElementById('loadHistoryBtn');
      const loadText = document.getElementById('loadHistoryText');
      const loadSpinner = document.getElementById('loadHistorySpinner');
      const historyContent = document.getElementById('historyContent');
      
      if (!validatePhone(phone)) {
        historyContent.innerHTML = '<div class="no-transactions" style="color: #ef4444;">Please enter a valid Safaricom number</div>';
        return;
      }
      
      // Show loading state
      loadBtn.disabled = true;
      loadText.textContent = 'Loading...';
      loadSpinner.style.display = 'inline-block';
      historyContent.innerHTML = '<div class="no-transactions"><div class="loading-spinner" style="margin: 0 auto;"></div><br>Loading your transaction history...</div>';
      
      try {
        const response = await fetch(`/api/transactions/${encodeURIComponent(phone)}`);
        const data = await response.json();
        
        if (data.success && data.transactions) {
          if (data.transactions.length === 0) {
            historyContent.innerHTML = '<div class="no-transactions">No transactions found for this number</div>';
          } else {
            renderTransactionHistory(data.transactions);
          }
        } else {
          historyContent.innerHTML = '<div class="no-transactions" style="color: #ef4444;">Failed to load transaction history</div>';
        }
      } catch (error) {
        console.error('Error loading transaction history:', error);
        historyContent.innerHTML = '<div class="no-transactions" style="color: #ef4444;">Error loading transaction history. Please try again.</div>';
      } finally {
        // Reset loading state
        loadBtn.disabled = false;
        loadText.textContent = 'Load Transaction History';
        loadSpinner.style.display = 'none';
      }
    }

    function renderTransactionHistory(transactions) {
      const historyContent = document.getElementById('historyContent');
      
      const transactionsHtml = transactions.map(transaction => {
        const date = new Date(transaction.createdAt).toLocaleString();
        const statusClass = `status-${transaction.status.toLowerCase()}`;
        
        return `
          <div class="transaction-item">
            <div class="transaction-header">
              <div class="transaction-offer">${transaction.offerName}</div>
              <div class="transaction-amount">Ksh ${transaction.amount}</div>
            </div>
            <div class="transaction-details">
              <div><strong>Type:</strong> ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</div>
              <div><strong>Status:</strong> <span class="transaction-status ${statusClass}">${transaction.status}</span></div>
              <div><strong>Payer:</strong> ${formatPhoneForDisplay(transaction.payerPhone)}</div>
              <div><strong>Recipient:</strong> ${formatPhoneForDisplay(transaction.recipientPhone)}</div>
            </div>
            ${transaction.responseDescription ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 0.5rem;">${transaction.responseDescription}</div>` : ''}
            <div class="transaction-date">${date}</div>
          </div>
        `;
      }).join('');
      
      historyContent.innerHTML = transactionsHtml;
    }

    function formatPhoneForDisplay(phone) {
      if (phone.startsWith('254')) {
        return '0' + phone.slice(3);
      }
      return phone;
    }

    // Event listeners for transaction history
    document.getElementById('historyBtn').addEventListener('click', showHistoryModal);
    document.getElementById('historyCloseBtn').addEventListener('click', hideHistoryModal);
    document.getElementById('loadHistoryBtn').addEventListener('click', loadTransactionHistory);

    // Close history modal when clicking overlay
    document.getElementById('historyModal').addEventListener('click', (e) => {
      if (e.target.id === 'historyModal') hideHistoryModal();
    });

    // Allow Enter key to load history
    document.getElementById('historyPhone').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loadTransactionHistory();
      }
    });
    // Render all offers
    renderOffers(dataOffers, "data-offers", "data");
    renderOffers(renewableOffers, "renewable-offers", "renewable");
    renderOffers(monthlyOffers, "monthly-offers", "monthly");
    renderOffers(minutesOffers, "minutes-offers", "minutes");
    renderOffers(smsOffers, "sms-offers", "sms");
    renderOffers(airtimeOffers, "airtime-offers", "airtime");
    renderOffers(bongaOffers, "bonga-offers", "bonga");
  </script>
</body>
</html>