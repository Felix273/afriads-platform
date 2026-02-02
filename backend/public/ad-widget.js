// AfriAds Ad Widget Script
(function() {
  'use strict';

  // Create AfriAds namespace
  window.AfriAds = window.AfriAds || {};

  // Configuration
  const API_BASE_URL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':5000' : '') + '/api';

  // Main load ad function
  AfriAds.loadAd = function(config) {
    const { zoneId, websiteId, containerId } = config;

    if (!zoneId || !websiteId || !containerId) {
      console.error('AfriAds: Missing required parameters');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error('AfriAds: Container not found - ' + containerId);
      return;
    }

    // Show loading state
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">Loading ad...</div>';

    // Fetch ad from server
    fetch(`${API_BASE_URL}/ad-serve/serve?zone_id=${zoneId}&website_id=${websiteId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data) {
          renderAd(container, data.data);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">No ads available</div>';
        }
      })
      .catch(error => {
        console.error('AfriAds: Error loading ad', error);
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">Ad failed to load</div>';
      });
  };

  // Render ad in container
  function renderAd(container, adData) {
    const { impression_id, ad, tracking } = adData;

    // Create ad HTML
    const adHtml = `
      <div class="afriads-ad" style="
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s;
        cursor: pointer;
      " 
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
      onclick="AfriAds.handleClick('${tracking.click_url}')">
        ${ad.image_url ? `
          <div style="width:100%; overflow:hidden;">
            <img src="${ad.image_url}" alt="${ad.title}" style="width:100%; height:auto; display:block;">
          </div>
        ` : ''}
        <div style="padding: 15px;">
          <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:bold; color:#333;">
            ${ad.title}
          </h3>
          <p style="margin:0 0 12px 0; font-size:14px; color:#666; line-height:1.5;">
            ${ad.description}
          </p>
          <span style="
            display:inline-block;
            background:#667eea;
            color:white;
            padding:8px 16px;
            border-radius:4px;
            font-size:14px;
            font-weight:600;
            text-decoration:none;
          ">
            ${ad.call_to_action || 'Learn More'}
          </span>
        </div>
        <div style="
          padding: 8px 15px;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
          font-size: 10px;
          color: #999;
          text-align: right;
        ">
          Advertisement
        </div>
      </div>
    `;

    container.innerHTML = adHtml;

    // Track impression automatically
    trackImpression(impression_id);
  }

  // Track impression
  function trackImpression(impressionId) {
    // Fire impression pixel (already tracked by server on ad request)
    console.log('AfriAds: Impression tracked - ' + impressionId);
  }

  // Handle ad click
  AfriAds.handleClick = function(clickUrl) {
    // Open in new tab and track click
    window.open(clickUrl, '_blank');
    console.log('AfriAds: Click tracked');
  };

  // Auto-initialize ads with data attributes
  function autoInit() {
    const adContainers = document.querySelectorAll('[data-afriads-zone]');
    adContainers.forEach(container => {
      const zoneId = container.getAttribute('data-afriads-zone');
      const websiteId = container.getAttribute('data-afriads-website');
      const containerId = container.id || 'afriads-' + Math.random().toString(36).substr(2, 9);
      
      if (!container.id) {
        container.id = containerId;
      }

      AfriAds.loadAd({
        zoneId: zoneId,
        websiteId: websiteId,
        containerId: containerId
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  console.log('AfriAds Widget Loaded');
})();
