/**
 * PigiaMe — detail page extractor.
 */
class PigiaMeExtractor {
  extract($, url, baseUrl) {
    const d = { sourceURL: url, sourceID: this._idFromUrl(url) };

    d.title = $("h1").first().text().trim() || $("h2").first().text().trim();

    d.description =
      $(".listing-description, .ad-description, .description, [class*='description']")
        .first()
        .text()
        .trim() || "";

    const priceText =
      $(".listing-price, .ad-price, .price, [class*='price']").first().text().trim();
    d.price = priceText;
    d.currency = /KSh|KES/i.test(priceText) ? "KES" : "KES";

    d.propertyType =
      $(".property-type, .ad-type, [class*='property-type']").first().text().trim() ||
      $("nav.breadcrumb a").last().text().trim() ||
      "";

    const bodyText = $("body").text().toLowerCase();
    d.listingType = /for rent|to rent|rent\b/i.test(bodyText) ? "for-rent" : "for-sale";

    const locText = $(".listing-location, .ad-location, .location, [class*='location']")
      .first()
      .text()
      .trim();
    if (locText) {
      const parts = locText.split(",").map((x) => x.trim()).filter(Boolean);
      d.estate = parts[0] || "";
      d.town = parts[1] || "";
      d.county = parts[2] || "Nairobi";
    }

    d.bedrooms = this._num($, '[class*="bed" i]:not([class*="bath" i])');
    d.bathrooms = this._num($, '[class*="bath" i]');
    d.parking = this._num($, '[class*="parking" i]');
    d.size = ($('[class*="size" i], [class*="area" i]').first().text().trim() || "")
      .replace(/[^0-9.]/g, "");

    // Images: PigiaMe lists them in <a data-fancybox="gallery"> or <img class="...">.
    d.images = [];
    const seen = new Set();
    $(
      'a[data-fancybox="gallery"] img, .gallery img, .listing-images img, [class*="gallery"] img, [class*="slider"] img'
    ).each((_, e) => {
      const raw =
        $(e).attr("data-src") ||
        $(e).attr("data-original") ||
        $(e).attr("srcset") ||
        $(e).attr("src");
      if (!raw) return;
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
    // Also pick up high-res originals from anchor hrefs (fancybox pattern).
    $('a[data-fancybox="gallery"]').each((_, e) => {
      const href = $(e).attr("href");
      if (href && /^https?:\/\//i.test(href) && !seen.has(href)) {
        seen.add(href);
        d.images.push(href);
      }
    });

    d.amenities = [];
    $('.features li, .amenities li, [class*="feature" i] li, [class*="amenit" i] li').each((_, e) => {
      const t = $(e).text().trim();
      if (t && t.length < 80) d.amenities.push(t);
    });

    d.agentName = $(".seller-info, .contact-info, .agent-name, [class*='seller']").first().text().trim();
    d.agencyName = "";
    d.agentPhone = $('a[href^="tel:"]').first().attr("href") || "";
    d.agentEmail = "";

    d.furnished = /furnished/i.test(bodyText);
    d.serviced = /serviced/i.test(bodyText);
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
      const u = new URL(url);
      const last = u.pathname.split("/").filter(Boolean).pop() || "";
      return last.replace(/\.html$/i, "");
    } catch (_) {
      return "";
    }
  }
}

module.exports = PigiaMeExtractor;
