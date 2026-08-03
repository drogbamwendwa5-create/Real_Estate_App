/**
 * Selectors Configuration for Property Scrapers
 * 
 * Centralized CSS selectors for all scraped websites.
 * Each source has its own set of selectors for listing pages,
 * detail pages, and pagination elements.
 * 
 * Selectors are organized by source key and page type.
 * This allows selectors to be updated without modifying scraper code.
 */
module.exports = {
  defaults: {
    listing: {
      container: '.property-card, .listing-card, .property-item, .listing-item, article',
      link: 'a[href*="/listing"], a[href*="/property"], a[href*="/details"], a[href*="/ad"]',
      title: 'h2, h3, .title, .property-title, .listing-title',
      price: '.price, .property-price, .listing-price, [class*="price"]',
      image: 'img, .property-image img, .listing-image img, [class*="image"] img',
    },
    detail: {
      title: 'h1, .property-title, .listing-title, .detail-title',
      price: '.price, .property-price, .listing-price, [class*="price"]',
      description: '.description, .property-description, .listing-description, [class*="description"]',
      location: '.location, .address, .property-location, [class*="location"]',
      images: 'img[class*="gallery"], .gallery img, .property-images img, [class*="photo"] img',
      bedrooms: '[class*="bedroom"], [class*="bed"], [class*="beds"]',
      bathrooms: '[class*="bathroom"], [class*="bath"], [class*="baths"]',
      size: '[class*="size"], [class*="area"], [class*="sqft"], [class*="sqm"]',
      amenities: '[class*="amenity"], [class*="feature"], [class*="facility"]',
      agentName: '[class*="agent"], [class*="contact"], [class*="seller"]',
      agentPhone: '[class*="phone"], [class*="contact"], a[href^="tel:"]',
      postedDate: '[class*="date"], [class*="posted"], [class*="added"], time',
    },
    pagination: {
      nextPage: 'a[rel="next"], .next, .pagination-next, a[aria-label="Next"], .pagination a:last-child',
      pageNumbers: '.pagination a, .page-numbers a, .pages a, a[class*="page"]',
      loadMore: 'button[class*="load-more"], button[class*="load_more"], [class*="show-more"]',
      hasNext: '[class*="pagination"] a:not([disabled]):not([class*="active"])',
    }
  },
  
  sources: {
    // BuyRent Kenya
    buyrent: {
      baseUrl: 'https://www.buyrentkenya.com',
      listing: {
        container: '.property-card, .listing-card, .property-item',
        link: 'a[href*="/listings/"]',
        title: '.property-title, .card-title',
        price: '.property-price, .price-tag',
        image: '.property-image img, .card-image img',
      },
      detail: {
        title: 'h1, .property-title',
        price: '.property-price, .price-value',
        description: '.property-description, .description-content',
        location: '.property-location, .location-info',
        images: '.gallery img, .property-gallery img, .photo-gallery img',
        bedrooms: '[class*="bedroom"], [class*="bed"]',
        bathrooms: '[class*="bathroom"], [class*="bath"]',
        size: '[class*="size"], [class*="area"]',
        amenities: '.amenities-list li, .features-list li',
        agentName: '.agent-name, .contact-name, .seller-info',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date-added, time',
      },
      pagination: {
        nextPage: 'a[rel="next"], .pagination .next, a[aria-label="Next page"]',
        hasNext: '.pagination a:not(.disabled)',
        loadMore: '.load-more, .show-more',
        infiniteScroll: true,
      }
    },

    // Property24 Kenya
    property24: {
      baseUrl: 'https://www.property24.co.ke',
      listing: {
        container: '.p24_property, .p24_listing, .propertyListItem',
        link: 'a[href*="/property/"], a[href*="/for-sale/"], a[href*="/to-rent/"]',
        title: '.p24_title, .listingTitle, .propertyTitle',
        price: '.p24_price, .listingPrice, .propertyPrice',
        image: '.p24_image img, .listingImage img',
      },
      detail: {
        title: 'h1, .p24_title, .propertyTitle',
        price: '.p24_price, .priceDisplay',
        description: '.p24_description, .propertyDescription',
        location: '.p24_location, .propertyAddress',
        images: '.p24_gallery img, .galleryImage',
        bedrooms: '.p24_bedrooms, .bedroomCount',
        bathrooms: '.p24_bathrooms, .bathroomCount',
        size: '.p24_size, .propertySize',
        amenities: '.p24_features li, .amenitiesList li',
        agentName: '.p24_agent, .agentName',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.p24_date, .listingDate',
      },
      pagination: {
        nextPage: '.p24_next, a[rel="next"]',
        hasNext: '.p24_pagination a:not(.disabled)',
      }
    },

    // Kenya Property Centre
    kenyapropertycentre: {
      baseUrl: 'https://www.kenyapropertycentre.com',
      listing: {
        container: '.property-item, .listing-item, .property-card',
        link: 'a[href*="/property/"], a[href*="/for-sale/"], a[href*="/to-rent/"]',
        title: '.property-title, .item-title',
        price: '.property-price, .item-price',
        image: '.property-image img, .item-image img',
      },
      detail: {
        title: 'h1, .property-title',
        price: '.property-price, .price-value',
        description: '.property-description, .description',
        location: '.property-location, .location',
        images: '.property-images img, .gallery img',
        bedrooms: '.bedrooms, .bed',
        bathrooms: '.bathrooms, .bath',
        size: '.property-size, .size',
        amenities: '.amenities li, .features li',
        agentName: '.agent-name, .contact-details',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date',
      },
      pagination: {
        nextPage: '.pagination .next, a[rel="next"]',
        hasNext: '.pagination a:not(.disabled)',
      }
    },

    // Hauzisha
    hauzisha: {
      baseUrl: 'https://www.hauzisha.co.ke',
      listing: {
        container: '.property-card, .listing-card, .ad-card',
        link: 'a[href*="/property/"], a[href*="/listing/"], a[href*="/ad/"]',
        title: '.card-title, .property-title, .ad-title',
        price: '.card-price, .property-price, .ad-price',
        image: '.card-image img, .property-image img',
      },
      detail: {
        title: 'h1, .property-title, .ad-title',
        price: '.property-price, .ad-price, .price',
        description: '.property-description, .ad-description',
        location: '.property-location, .ad-location',
        images: '.gallery img, .property-images img',
        bedrooms: '.bedrooms, .beds',
        bathrooms: '.bathrooms, .baths',
        size: '.size, .area',
        amenities: '.amenities li, .features li',
        agentName: '.agent-name, .seller-name',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date, time',
      },
      pagination: {
        nextPage: '.pagination .next, a[rel="next"]',
        hasNext: '.pagination a:not(.disabled)',
        loadMore: '.load-more, .show-more',
      }
    },

    // Jiji Kenya
    jiji: {
      baseUrl: 'https://jiji.co.ke',
      listing: {
        container: '.b-list-advert__item, .listing-card, .advert-item',
        link: 'a[href*="/property-"], a[href*="/apartment-"], a[href*="/house-"], a[href*="/land-"]',
        title: '.b-list-advert__item__title, .advert-title',
        price: '.b-list-advert__item__price, .advert-price',
        image: '.b-list-advert__item__image img, .advert-image img',
      },
      detail: {
        title: 'h1, .advert-detail-title',
        price: '.advert-detail-price, .price',
        description: '.advert-detail-description, .description',
        location: '.advert-detail-location, .location',
        images: '.advert-gallery img, .gallery img',
        bedrooms: '.bedrooms, .beds, [class*="bed"]',
        bathrooms: '.bathrooms, .baths, [class*="bath"]',
        size: '.size, .area, [class*="size"]',
        amenities: '.features li, .amenities li',
        agentName: '.seller-name, .contact-name',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date, time',
      },
      pagination: {
        nextPage: 'a[rel="next"], .next-page',
        loadMore: '.load-more, .show-more',
        infiniteScroll: true,
      }
    },

    // PigiaMe
    pigianme: {
      baseUrl: 'https://www.pigianme.co.ke',
      listing: {
        container: '.listing-item, .ad-item, .property-item',
        link: 'a[href*="/property-"], a[href*="/real-estate-"], a[href*="/house-"]',
        title: '.listing-title, .item-title, .ad-title',
        price: '.listing-price, .item-price, .ad-price',
        image: '.listing-image img, .item-image img',
      },
      detail: {
        title: 'h1, .listing-title, .ad-title',
        price: '.listing-price, .ad-price',
        description: '.listing-description, .ad-description',
        location: '.listing-location, .ad-location',
        images: '.gallery img, .listing-images img',
        bedrooms: '.bedrooms, .beds',
        bathrooms: '.bathrooms, .baths',
        size: '.size, .area',
        amenities: '.features li, .amenities li',
        agentName: '.seller-info, .contact-info',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date',
      },
      pagination: {
        nextPage: '.pagination .next, a[rel="next"]',
        hasNext: '.pagination a:not(.disabled)',
      }
    },

    // RentKenya
    rentkenya: {
      baseUrl: 'https://www.rentkenya.com',
      listing: {
        container: '.property-card, .listing-card, .rental-item',
        link: 'a[href*="/rent/"], a[href*="/property/"], a[href*="/apartment/"]',
        title: '.property-title, .card-title, .rental-title',
        price: '.property-price, .card-price, .rental-price',
        image: '.property-image img, .card-image img',
      },
      detail: {
        title: 'h1, .property-title, .rental-title',
        price: '.property-price, .rental-price',
        description: '.property-description, .rental-description',
        location: '.property-location, .rental-location',
        images: '.gallery img, .property-images img',
        bedrooms: '.bedrooms, .beds',
        bathrooms: '.bathrooms, .baths',
        size: '.size, .area',
        amenities: '.amenities li, .features li',
        agentName: '.agent-name, .contact-name',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.posted-date, .date, time',
      },
      pagination: {
        nextPage: '.pagination .next, a[rel="next"]',
        hasNext: '.pagination a:not(.disabled)',
      }
    },

    // Airbnb
    airbnb: {
      baseUrl: 'https://www.airbnb.com',
      listing: {
        container: '[data-testid="card-container"], .listing-card, .property-card',
        link: 'a[href*="/rooms/"], a[href*="/homes/"]',
        title: '[data-testid="listing-card-title"], .listing-title',
        price: '[data-testid="price-availability-row"], .price-amount',
        image: '[data-testid="card-image"] img, .listing-image img',
      },
      detail: {
        title: 'h1, [data-testid="listing-title"]',
        price: '[data-testid="price-availability-row"], .price',
        description: '[data-testid="listing-description"], .description',
        location: '[data-testid="listing-location"], .location',
        images: '[data-testid="photo-viewer"] img, .gallery img',
        bedrooms: '[data-testid="bedrooms"], .bedrooms',
        bathrooms: '[data-testid="bathrooms"], .bathrooms',
        amenities: '[data-testid="amenities"] li, .amenities-list li',
        postedDate: '[data-testid="listing-date"], .date',
      },
      pagination: {
        infiniteScroll: true,
        loadMore: 'button[data-testid="search-tabs-next-button"]',
      }
    },

    // Booking.com
    booking: {
      baseUrl: 'https://www.booking.com',
      listing: {
        container: '[data-testid="property-card"], .sr_property_block',
        link: 'a[href*="/hotel/"], a[href*="/property/"]',
        title: '[data-testid="title"], .sr-hotel__name',
        price: '[data-testid="price-for-x-nights"], .bui-price-display__value',
        image: '[data-testid="image"] img, .hotel_image img',
      },
      detail: {
        title: 'h2, .hp__hotel-name',
        price: '.bui-price-display__value, .price',
        description: '#property_description_content, .hp_desc',
        location: '.hp_address_subtitle, .location',
        images: '.hotel-photos img, .bh-photo-container img',
        amenities: '.facility-list li, .hp_facilities li',
      },
      pagination: {
        nextPage: 'a[aria-label="Next page"]',
        hasNext: '.pagination-next',
      }
    },

    // VRBO
    vrbo: {
      baseUrl: 'https://www.vrbo.com',
      listing: {
        container: '[data-testid="listing-card"], .property-card',
        link: 'a[href*="/vacation-rental/"], a[href*="/rental/"]',
        title: '[data-testid="listing-title"], .listing-title',
        price: '[data-testid="price-summary"], .price',
        image: '[data-testid="card-image"] img, .card-image img',
      },
      detail: {
        title: 'h1, .listing-title',
        price: '.price, .price-summary',
        description: '.description, .property-description',
        location: '.location, .property-location',
        images: '.gallery img, .photo-gallery img',
        bedrooms: '.bedrooms, .beds',
        bathrooms: '.bathrooms, .baths',
        amenities: '.amenities li, .features li',
      },
      pagination: {
        nextPage: 'a[rel="next"], .next-page',
        infiniteScroll: true,
      }
    },

    // Developer websites (generic)
    developers: {
      baseUrl: '',
      listing: {
        container: '.property-card, .project-card, .development-card, .listing-card',
        link: 'a[href*="/property"], a[href*="/project"], a[href*="/development"], a[href*="/listing"]',
        title: '.card-title, .project-title, .property-title, h2, h3',
        price: '.card-price, .project-price, .price, .starting-from',
        image: '.card-image img, .project-image img, img[class*="photo"]',
      },
      detail: {
        title: 'h1, .project-title, .property-title',
        price: '.price, .project-price, .starting-price',
        description: '.description, .project-description, .property-description',
        location: '.location, .project-location, .address',
        images: '.gallery img, .project-gallery img, .photo-gallery img',
        bedrooms: '.bedrooms, .beds, [class*="bed"]',
        bathrooms: '.bathrooms, .baths, [class*="bath"]',
        size: '.size, .area, .sqm, [class*="size"]',
        amenities: '.amenities li, .features li, .facilities li',
        agentName: '.contact-name, .agent-name, .developer-name',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.date, .posted-date, time',
      },
      pagination: {
        nextPage: '.next, a[rel="next"], .pagination-next',
        hasNext: '.pagination a:not(.disabled)',
        loadMore: '.load-more, .show-more, .view-more',
      }
    },

    // Commercial listings (generic)
    commercial: {
      baseUrl: '',
      listing: {
        container: '.property-card, .listing-card, .commercial-item, .office-item',
        link: 'a[href*="/property"], a[href*="/listing"], a[href*="/office"], a[href*="/commercial"]',
        title: '.card-title, .property-title, .listing-title, h2, h3',
        price: '.card-price, .property-price, .price, .rental-price',
        image: '.card-image img, .property-image img',
      },
      detail: {
        title: 'h1, .property-title, .listing-title',
        price: '.price, .property-price, .rental-price',
        description: '.description, .property-description',
        location: '.location, .property-location, .address',
        images: '.gallery img, .property-images img',
        bedrooms: '.bedrooms, .beds',
        bathrooms: '.bathrooms, .baths',
        size: '.size, .area, .sqm, .sqft',
        amenities: '.amenities li, .features li, .facilities li',
        agentName: '.agent-name, .contact-name, .broker-name',
        agentPhone: 'a[href^="tel:"]',
        postedDate: '.date, .posted-date, time',
      },
      pagination: {
        nextPage: '.next, a[rel="next"], .pagination-next',
        hasNext: '.pagination a:not(.disabled)',
      }
    }
  }
};