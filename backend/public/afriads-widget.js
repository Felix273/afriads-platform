/**
 * AfriAds Widget - Embed this on your website to show ads
 * Usage: <div id="afriads-zone-1" data-zone-id="1" data-website-id="YOUR_WEBSITE_ID"></div>
 */

(function() {
  'use strict';
  
  const currentScript = document.currentScript || Array.from(document.scripts).find(script => script.src && script.src.includes('afriads-widget.js'));
  const scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : window.location.origin;
  const AFRIADS_API = `${scriptOrigin}/api/ad-serve`;
  
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
      const response = await fetch(`${AFRIADS_API}/serve?zone_id=${zoneId}&website_id=${websiteId}`);
      const data = await response.json();
      
      if (!data.success) {
        console.log('AfriAds: No ads available');
        return;
      }
      
      // Render the ad
      renderAd(data.data, container);
      
    } catch (error) {
      console.error('AfriAds: Failed to load ad', error);
    }
  }
  
  function renderAd(adData, container) {
    const { ad, tracking, impression_id } = adData;
    
    // Create ad HTML based on format
    let adHTML = '';
    
    if (ad.ad_type === 'display') {
      adHTML = `
        <div class="afriads-ad" style="text-align: center; border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">
          ${ad.image_url ? `<img src="${ad.image_url}" alt="${ad.title}" style="max-width: 100%; height: auto;">` : ''}
          <h3 style="margin: 10px 0; font-size: 18px;">${ad.title}</h3>
          <p style="margin: 10px 0; color: #666;">${ad.description}</p>
          <a href="${tracking.click_url}" 
             target="_blank" 
             class="afriads-cta"
             style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            ${ad.call_to_action || 'Learn More'}
          </a>
          <div style="font-size: 10px; color: #999; margin-top: 10px;">Advertisement</div>
        </div>
      `;
    } else if (ad.ad_type === 'video') {
      adHTML = `
        <div class="afriads-ad" style="text-align: center; border: 1px solid #ddd; padding: 10px; background: #000;">
          <video controls style="max-width: 100%;">
            <source src="${ad.video_url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <a href="${tracking.click_url}" 
             target="_blank" 
             style="display: block; padding: 10px; background: #4CAF50; color: white; text-decoration: none; margin-top: 10px;">
            ${ad.call_to_action || 'Learn More'}
          </a>
        </div>
      `;
    } else if (ad.ad_type === 'native') {
      adHTML = `
        <div class="afriads-ad afriads-native" style="border: 1px solid #ddd; padding: 15px; background: #fff;">
          ${ad.image_url ? `<img src="${ad.image_url}" alt="${ad.title}" style="width: 100%; height: auto; margin-bottom: 10px;">` : ''}
          <h3 style="margin: 0 0 10px 0; font-size: 20px;">${ad.title}</h3>
          <p style="margin: 0 0 15px 0; color: #333;">${ad.description}</p>
          <a href="${tracking.click_url}" 
             target="_blank" 
             style="display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px;">
            ${ad.call_to_action || 'Read More'}
          </a>
          <div style="font-size: 10px; color: #999; margin-top: 10px;">Sponsored Content</div>
        </div>
      `;
    }
    
    container.innerHTML = adHTML;
    
    // Track impression viewability (when ad is 50% visible)
    observeAdViewability(container, impression_id);
  }
  
  function observeAdViewability(element, impressionId) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Ad is viewable
          console.log('AfriAds: Ad viewable', impressionId);
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(element);
  }
  
  // Conversion tracking function (for advertisers to call)
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
