// AfriAds Ad Widget Script
(function() {
  'use strict';

  // Create AfriAds namespace
  window.AfriAds = window.AfriAds || {};

  // Configuration
  const currentScript = document.currentScript || Array.from(document.scripts).find(script => script.src && script.src.includes('ad-widget.js'));
  const scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : window.location.origin;
  const API_BASE_URL = `${scriptOrigin}/api`;

  function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
    try {
      const parsed = new URL(trimmed, window.location.origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

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

    // Show loading state safely
    container.textContent = '';
    const loadingEl = document.createElement('div');
    loadingEl.style.textAlign = 'center';
    loadingEl.style.padding = '20px';
    loadingEl.style.color = '#999';
    loadingEl.textContent = 'Loading ad...';
    container.appendChild(loadingEl);

    // Fetch ad from server
    fetch(`${API_BASE_URL}/ad-serve/serve?zone_id=${encodeURIComponent(zoneId)}&website_id=${encodeURIComponent(websiteId)}`)
      .then(response => response.json())
      .then(data => {
        container.textContent = '';
        if (data.success && data.data) {
          renderAd(container, data.data);
        }
      })
      .catch(error => {
        console.error('AfriAds: Error loading ad', error);
        container.textContent = '';
      });
  };

  // Render ad in container safely using DOM APIs (no innerHTML)
  function renderAd(container, adData) {
    const { impression_id, ad, tracking } = adData;
    if (!ad) return;

    const adWrapper = document.createElement('div');
    adWrapper.className = 'afriads-ad';
    adWrapper.style.border = '1px solid #e0e0e0';
    adWrapper.style.borderRadius = '8px';
    adWrapper.style.overflow = 'hidden';
    adWrapper.style.background = 'white';
    adWrapper.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    adWrapper.style.transition = 'transform 0.2s';
    adWrapper.style.cursor = 'pointer';

    adWrapper.addEventListener('mouseover', () => {
      adWrapper.style.transform = 'translateY(-2px)';
      adWrapper.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    });

    adWrapper.addEventListener('mouseout', () => {
      adWrapper.style.transform = 'translateY(0)';
      adWrapper.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    if (tracking && tracking.click_url && isSafeUrl(tracking.click_url)) {
      adWrapper.addEventListener('click', () => {
        AfriAds.handleClick(tracking.click_url);
      });
    }

    if (ad.image_url && isSafeUrl(ad.image_url)) {
      const imgContainer = document.createElement('div');
      imgContainer.style.width = '100%';
      imgContainer.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.src = ad.image_url;
      img.alt = ad.title || 'Advertisement';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';

      imgContainer.appendChild(img);
      adWrapper.appendChild(imgContainer);
    }

    const contentDiv = document.createElement('div');
    contentDiv.style.padding = '15px';

    const titleEl = document.createElement('h3');
    titleEl.style.margin = '0 0 8px 0';
    titleEl.style.fontSize = '18px';
    titleEl.style.fontWeight = 'bold';
    titleEl.style.color = '#333';
    titleEl.textContent = ad.title || '';
    contentDiv.appendChild(titleEl);

    if (ad.description) {
      const descEl = document.createElement('p');
      descEl.style.margin = '0 0 12px 0';
      descEl.style.fontSize = '14px';
      descEl.style.color = '#666';
      descEl.style.lineHeight = '1.5';
      descEl.textContent = ad.description;
      contentDiv.appendChild(descEl);
    }

    const ctaSpan = document.createElement('span');
    ctaSpan.style.display = 'inline-block';
    ctaSpan.style.background = '#667eea';
    ctaSpan.style.color = 'white';
    ctaSpan.style.padding = '8px 16px';
    ctaSpan.style.borderRadius = '4px';
    ctaSpan.style.fontSize = '14px';
    ctaSpan.style.fontWeight = '600';
    ctaSpan.style.textDecoration = 'none';
    ctaSpan.textContent = ad.call_to_action || 'Learn More';
    contentDiv.appendChild(ctaSpan);

    adWrapper.appendChild(contentDiv);

    const footerDiv = document.createElement('div');
    footerDiv.style.padding = '8px 15px';
    footerDiv.style.background = '#f5f5f5';
    footerDiv.style.borderTop = '1px solid #e0e0e0';
    footerDiv.style.fontSize = '10px';
    footerDiv.style.color = '#999';
    footerDiv.style.textAlign = 'right';
    footerDiv.textContent = 'Advertisement';
    adWrapper.appendChild(footerDiv);

    container.textContent = '';
    container.appendChild(adWrapper);

    // Track impression automatically
    trackImpression(impression_id);
  }

  // Track impression
  function trackImpression(impressionId) {
    console.log('AfriAds: Impression tracked - ' + impressionId);
  }

  // Handle ad click
  AfriAds.handleClick = function(clickUrl) {
    if (isSafeUrl(clickUrl)) {
      window.open(clickUrl, '_blank', 'noopener,noreferrer');
      console.log('AfriAds: Click tracked');
    }
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
