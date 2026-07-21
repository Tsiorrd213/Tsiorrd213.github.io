(function () {
    'use strict';

    const config = window.AICA_ANALYTICS_CONFIG || {};
    const clarityProjectId = String(config.clarityProjectId || '').trim();
    const isConfigured = clarityProjectId &&
        clarityProjectId !== 'REPLACE_WITH_CLARITY_PROJECT_ID';

    if (!isConfigured) {
        console.info('[AICA analytics] Add the free Clarity project ID to analytics-config.js to enable tracking.');
        return;
    }

    // Official Microsoft Clarity loader. Clarity supplies click/scroll heatmaps,
    // session recordings, dashboards, smart events, and bot filtering.
    (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
            (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityProjectId);

    const cleanValue = (value, fallback) => {
        const normalized = String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 120);
        return normalized || fallback;
    };

    const setTag = (key, value) => {
        if (value) {
            window.clarity('set', key, String(value).slice(0, 255));
        }
    };

    const trackEvent = (eventName) => {
        window.clarity('event', cleanValue(eventName, 'unknown_event'));
    };

    const query = new URLSearchParams(window.location.search);
    const campaignTags = {
        traffic_source: query.get('utm_source') || 'direct',
        traffic_medium: query.get('utm_medium') || 'none',
        traffic_campaign: query.get('utm_campaign') || 'none',
        traffic_content: query.get('utm_content') || 'none'
    };

    Object.entries(campaignTags).forEach(([key, value]) => setTag(key, value));
    setTag('landing_page', window.location.pathname || '/');
    trackEvent('landing_page_view');

    const destinationFor = (url) => {
        const hostname = url.hostname.replace(/^www\./, '');
        if (hostname.includes('spotify.com')) return 'spotify';
        if (hostname.includes('patreon.com')) return 'patreon';
        if (hostname.includes('youtube.com') || hostname === 'youtu.be') return 'youtube';
        if (hostname.includes('linkedin.com')) return 'linkedin';
        return cleanValue(hostname, 'external');
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;

        const rawHref = link.getAttribute('href') || '';
        const label = cleanValue(
            link.dataset.analyticsLabel || link.getAttribute('aria-label') ||
            link.getAttribute('title') || link.textContent,
            'unlabelled_link'
        );

        setTag('last_click_label', label);

        if (rawHref.startsWith('#')) {
            const section = cleanValue(rawHref.slice(1), 'top');
            setTag('last_internal_section', section);
            trackEvent('navigation_' + section);
            return;
        }

        if (rawHref.startsWith('mailto:')) {
            trackEvent('contact_email_click');
            return;
        }

        let url;
        try {
            url = new URL(link.href, window.location.href);
        } catch (_error) {
            return;
        }

        if (url.origin !== window.location.origin) {
            const destination = destinationFor(url);
            setTag('last_outbound_destination', destination);
            trackEvent(destination + '_click');
            trackEvent('outbound_click');
        }
    }, { capture: true });

    const reachedDepths = new Set();
    const depthThresholds = [25, 50, 75, 90];
    let ticking = false;

    const recordScrollDepth = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return;

        const depth = Math.round((window.scrollY / scrollable) * 100);
        depthThresholds.forEach((threshold) => {
            if (depth >= threshold && !reachedDepths.has(threshold)) {
                reachedDepths.add(threshold);
                setTag('max_scroll_depth', threshold + '%');
                trackEvent('scroll_' + threshold);
            }
        });
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            recordScrollDepth();
            ticking = false;
        });
    }, { passive: true });
})();
