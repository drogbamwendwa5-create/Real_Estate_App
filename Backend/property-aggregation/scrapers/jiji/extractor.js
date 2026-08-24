/**
 * Jiji Kenya — detail page extractor.
 * Jiji uses an SPA, so we operate on the cheerio `$` of the rendered HTML.
 */
class JijiExtractor {
  extract($, url, baseUrl) {
    const d = { sourceURL: url, sourceID: this._idFromUrl(url) };

    // Title: h1 or first breadcrumb leaf
    d.title = $("h1").first().text().trim() || $("h1,h2").first().text().trim();

    // Description: Jiji renders the description block under [data-testid="description"]
    // or as a sequence of <p> tags inside .description.
    d.description =
      $('[data-testid="description"], .description, [class*="description"]')
        .first()
        .text()
        .trim() || "";

    // Price: Jiji price block contains "KSh" prefix.
    const priceText =
      $('[data-testid="ad-price"], .b-advert-price, [class*="price"]')
        .first()
        .text()
        .trim();
    d.price = priceText;
    d.currency =
      /KSh|KES/i.test(priceText) || /KSh|KES/i.test(d.title)
        ? "KES"
        : "KES";

    // Property type — Jiji has no strict type field; infer from category breadcrumb.
    d.propertyType =
      $('[data-testid="breadcrumb"], .b-advert-category, [class*="category"]')
        .first()
        .text()
        .trim() || "";

    // Listing type — Jiji URL and breadcrumbs often contain "For Rent" or "For Sale".
    const bodyText = $("body").text().toLowerCase();
    d.listingType = /for rent|for-rent|to rent|to-rent|rent/i.test(bodyText)
      ? "for-rent"
      : /for sale|for-sale|sale/i.test(bodyText)
      ? "for-sale"
      : "for-sale";

    // Location.
    const locText = $('[data-testid="ad-location"], .b-advert-location, [class*="location"]')
      .first()
      .text()
      .trim();
    if (locText) {
      const parts = locText.split(",").map((x) => x.trim()).filter(Boolean);
      d.estate = parts[0] || "";
      d.town = parts[1] || "";
      d.county = parts[2] || "Nairobi";
    }

    d.bedrooms = this._num($, '[class*="bed" i]:not([class*="bath"] i)');
    d.bathrooms = this._num($, '[class*="bath" i]');
    d.parking = this._num($, '[class*="parking" i]');
    d.size = ($('[class*="size" i], [class*="area" i]').first().text().trim() || "")
      .replace(/[^0-9.]/g, "");

    // Images: Jiji uses a gallery; pick from data-src first (lazy), then src.
    d.images = [];
    const seen = new Set();
    $(
      '[data-testid="ad-image"] img, .b-advert-gallery img, .gallery img, picture img, img[class*="gallery" i]'
    ).each((_, e) => {
      const raw =
        $(e).attr("data-src") ||
        $(e).attr("data-original") ||
        $(e).attr("srcset") ||
        $(e).attr("src");
      if (!raw) return;
      // srcset may be a comma-separated list of urls+descriptors
      const candidates = String(raw)
        .split(",")
        .map((s) => s.trim().split(" ")[0])
        .filter(Boolean);
      for (const c of candidates) {
        if (seen.has(c)) continue;
        seen.add(c);
        d.images.push(c);
      }
    });
    // Fallback: any large img in the document.
    if (d.images.length === 0) {
      $("img").each((_, e) => {
        const src = $(e).attr("src") || $(e).attr("data-src");
        if (!src) return;
        if (/avatar|logo|sprite/i.test(src)) return;
        seen.add(src);
        d.images.push(src);
      });
    }

    // Amenities / features
    d.amenities = [];
    $('[class*="feature" i] li, [class*="amenit" i] li, ul[class*="list"] li').each((_, e) => {
      const t = $(e).text().trim();
      if (t && t.length < 80) d.amenities.push(t);
    });

    // Agent info
    d.agentName = $('[data-testid="seller-name"], .b-seller__name, [class*="seller" i] [class*="name" i]')
      .first()
      .text()
      .trim();
    d.agencyName = "";
    d.agentPhone = $('a[href^="tel:"]').first().attr("href") || "";
    d.agentEmail = "";

    d.furnished = /furnished/i.test(bodyText);
    d.serviced = /serviced/i.test(bodyText);

    // Posted date — Jiji renders "X days ago"
    d.postedDate =
      $("time").first().attr("datetime") ||
      $('[class*="posted" i], [class*="date" i]').first().text().trim() ||
      "";

    return d;
  }

  _num($, selector) {
    const t = $(selector).first().text().trim();
    const m = t.match(/\d+/);
    return m ? m[0] : 0;
  }

  _idFromUrl(url) {
    try {
      const m = String(url).match(/-(?:[a-z0-9]+)\.html$/i) || String(url).match(/\/([a-z0-9]+)\.html$/i);
      if (m) return m[1];
      const u = new URL(url);
      const last = u.pathname.split("/").filter(Boolean).pop() || "";
      return last.replace(/\.html$/i, "");
    } catch (_) {
      return "";
    }
  }
}

module.exports = JijiExtractor;
