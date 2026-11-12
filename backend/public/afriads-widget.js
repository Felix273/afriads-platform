/**
 * AfriAds Widget - Embed this on your website to show ads
 * Usage: <div id="afriads-zone-1" data-zone-id="1" data-website-id="YOUR_WEBSITE_ID"></div>
 */

(function() {
  'use strict';
  
  const currentScript = document.currentScript || Array.from(document.scripts).find(script => script.src && script.src.includes('afriads-widget.js'));
  const scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : window.location.origin;
  const AFRIADS_API = `${scriptOrigin}/api/ad-serve`;

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
  
  // Find all ad zones on the page
  const adZones = document.querySelectorAll('[id^="afriads-zone-"]');
  
  adZones.forEach(zone => {
    const zoneId = zone.getAttribute('data-zone-id');
    const websiteId = zone.getAttribute('data-website-id');
    
    if (!zoneId || !websiteId) {
      console.error('AfriAds: Missing zone-id or website-id');
      return;
    }
    
    // Fetch ad from server
    fetchAd(zoneId, websiteId, zone);
  });
  
  async function fetchAd(zoneId, websiteId, container) {
    try {
      const response = await fetch(`${AFRIADS_API}/serve?zone_id=${encodeURIComponent(zoneId)}&website_id=${encodeURIComponent(websiteId)}`);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        console.log('AfriAds: No ads available');
        return;
      }
      
      // Render the ad safely
      renderAd(data.data, container);
      
    } catch (error) {
      console.error('AfriAds: Failed to load ad', error);
    }
  }
  
  function renderAd(adData, container) {
    const { ad, tracking, impression_id } = adData;
    if (!ad) return;

    container.textContent = '';
    const clickUrl = tracking && isSafeUrl(tracking.click_url) ? tracking.click_url : null;
    
    if (ad.ad_type === 'display') {
      const wrapper = document.createElement('div');
      wrapper.className = 'afriads-ad';
      wrapper.style.textAlign = 'center';
      wrapper.style.border = '1px solid #ddd';
      wrapper.style.padding = '10px';
      wrapper.style.background = '#f9f9f9';

      if (ad.image_url && isSafeUrl(ad.image_url)) {
        const img = document.createElement('img');
        img.src = ad.image_url;
        img.alt = ad.title || 'Advertisement';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        wrapper.appendChild(img);
      }

      const h3 = document.createElement('h3');
      h3.style.margin = '10px 0';
      h3.style.fontSize = '18px';
      h3.textContent = ad.title || '';
      wrapper.appendChild(h3);

      if (ad.description) {
        const p = document.createElement('p');
        p.style.margin = '10px 0';
        p.style.color = '#666';
        p.textContent = ad.description;
        wrapper.appendChild(p);
      }

      if (clickUrl) {
        const a = document.createElement('a');
        a.href = clickUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'afriads-cta';
        a.style.display = 'inline-block';
        a.style.padding = '10px 20px';
        a.style.background = '#4CAF50';
        a.style.color = 'white';
        a.style.textDecoration = 'none';
        a.style.borderRadius = '4px';
        a.textContent = ad.call_to_action || 'Learn More';
        wrapper.appendChild(a);
      }

      const footer = document.createElement('div');
      footer.style.fontSize = '10px';
      footer.style.color = '#999';
      footer.style.marginTop = '10px';
      footer.textContent = 'Advertisement';
      wrapper.appendChild(footer);

      container.appendChild(wrapper);

    } else if (ad.ad_type === 'video') {
      const wrapper = document.createElement('div');
      wrapper.className = 'afriads-ad';
      wrapper.style.textAlign = 'center';
      wrapper.style.border = '1px solid #ddd';
      wrapper.style.padding = '10px';
      wrapper.style.background = '#000';

      if (ad.video_url && isSafeUrl(ad.video_url)) {
        const video = document.createElement('video');
        video.controls = true;
        video.style.maxWidth = '100%';

        const source = document.createElement('source');
        source.src = ad.video_url;
        source.type = 'video/mp4';
        video.appendChild(source);

        wrapper.appendChild(video);
      }

      if (clickUrl) {
        const a = document.createElement('a');
        a.href = clickUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'block';
        a.style.padding = '10px';
        a.style.background = '#4CAF50';
        a.style.color = 'white';
        a.style.textDecoration = 'none';
        a.style.marginTop = '10px';
        a.textContent = ad.call_to_action || 'Learn More';
        wrapper.appendChild(a);
      }

      container.appendChild(wrapper);

    } else if (ad.ad_type === 'native') {
      const wrapper = document.createElement('div');
      wrapper.className = 'afriads-ad afriads-native';
      wrapper.style.border = '1px solid #ddd';
      wrapper.style.padding = '15px';
      wrapper.style.background = '#fff';

      if (ad.image_url && isSafeUrl(ad.image_url)) {
        const img = document.createElement('img');
        img.src = ad.image_url;
        img.alt = ad.title || 'Advertisement';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.marginBottom = '10px';
        wrapper.appendChild(img);
      }

      const h3 = document.createElement('h3');
      h3.style.margin = '0 0 10px 0';
      h3.style.fontSize = '20px';
      h3.textContent = ad.title || '';
      wrapper.appendChild(h3);

      if (ad.description) {
        const p = document.createElement('p');
        p.style.margin = '0 0 15px 0';
        p.style.color = '#333';
        p.textContent = ad.description;
        wrapper.appendChild(p);
      }

      if (clickUrl) {
        const a = document.createElement('a');
        a.href = clickUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'inline-block';
        a.style.padding = '10px 20px';
        a.style.background = '#2196F3';
        a.style.color = 'white';
        a.style.textDecoration = 'none';
        a.style.borderRadius = '4px';
        a.textContent = ad.call_to_action || 'Read More';
        wrapper.appendChild(a);
      }

      const footer = document.createElement('div');
      footer.style.fontSize = '10px';
      footer.style.color = '#999';
      footer.style.marginTop = '10px';
      footer.textContent = 'Sponsored Content';
      wrapper.appendChild(footer);

      container.appendChild(wrapper);
    }
    
    // Track impression viewability
    observeAdViewability(container, impression_id);
  }
  
  function observeAdViewability(element, impressionId) {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          console.log('AfriAds: Ad viewable', impressionId);
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(element);
  }
  
  // Conversion tracking function
  window.afriadsTrackConversion = function(impressionId, conversionType, conversionValue) {
    fetch(`${AFRIADS_API}/conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        impression_id: impressionId,
        conversion_type: conversionType,
        conversion_value: conversionValue
      })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('AfriAds: Conversion tracked successfully');
        }
      })
      .catch(error => {
        console.error('AfriAds: Conversion tracking failed', error);
      });
  };
  
})();
