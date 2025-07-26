/**
 * Lazy Loading System for Queen Rose Hiking Trail App
 * Improves performance by loading images only when they're needed
 */

class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.loadingPlaceholder = this.createLoadingPlaceholder();
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                // Start loading when image is 100px away from viewport
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            this.setupLazyImages();
        } else {
            // Fallback for older browsers - load all images immediately
            this.loadAllImages();
        }
    }

    createLoadingPlaceholder() {
        // Create SVG placeholder for loading state
        const svg = `
            <svg width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <circle cx="50%" cy="50%" r="20" fill="#4CAF50" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <text x="50%" y="60%" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="14">
                    Loading...
                </text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    setupLazyImages() {
        // Find all images that should be lazy loaded
        const images = document.querySelectorAll('img[data-src], img[src*="accommodation"], img[src*="elevation"]');
        
        images.forEach(img => {
            // Skip if already processed
            if (img.classList.contains('lazy-processed')) return;
            
            // Set up lazy loading
            if (img.dataset.src) {
                // Image already has data-src attribute
                this.prepareImageForLazyLoading(img);
            } else if (img.src && (img.src.includes('accommodation') || img.src.includes('elevation'))) {
                // Convert existing images to lazy loading
                img.dataset.src = img.src;
                this.prepareImageForLazyLoading(img);
            }
        });
    }

    prepareImageForLazyLoading(img) {
        // Add loading class and placeholder
        img.classList.add('lazy-image', 'lazy-processed');
        
        // Set placeholder
        const originalSrc = img.src;
        img.src = this.loadingPlaceholder;
        
        // Add loading styles
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '0.7';
        
        // Start observing
        this.imageObserver.observe(img);
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Image loaded successfully
            img.src = src;
            img.style.opacity = '1';
            img.classList.add('lazy-loaded');
            img.classList.remove('lazy-loading');
            
            // Remove data-src to prevent reloading
            delete img.dataset.src;
            
            // Dispatch custom event
            img.dispatchEvent(new CustomEvent('lazyImageLoaded', {
                detail: { src: src }
            }));
        };

        imageLoader.onerror = () => {
            // Handle loading error
            img.classList.add('lazy-error');
            img.alt = 'Image failed to load';
            console.warn('Failed to load lazy image:', src);
        };

        // Start loading
        img.classList.add('lazy-loading');
        imageLoader.src = src;
    }

    loadAllImages() {
        // Fallback for browsers without Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
        });
    }

    // Public method to manually trigger loading of specific images
    loadImagesBySelector(selector) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            if (img.dataset.src) {
                this.loadImage(img);
            }
        });
    }

    // Public method to add new images to lazy loading
    addNewImages(container = document) {
        const newImages = container.querySelectorAll('img[data-src]:not(.lazy-processed)');
        newImages.forEach(img => {
            this.prepareImageForLazyLoading(img);
        });
    }
}

// CSS styles for lazy loading (injected dynamically)
const lazyLoadingStyles = `
    .lazy-image {
        background-color: #f0f0f0;
        min-height: 200px;
        display: block;
    }
    
    .lazy-loading {
        opacity: 0.7;
    }
    
    .lazy-loaded {
        opacity: 1;
    }
    
    .lazy-error {
        background-color: #ffebee;
        color: #c62828;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
    }
    
    .lazy-error::before {
        content: "⚠ Image unavailable";
        font-size: 14px;
    }
`;

// Inject styles
function injectLazyLoadingStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = lazyLoadingStyles;
    document.head.appendChild(styleSheet);
}

// Initialize lazy loading when DOM is ready
let lazyLoader;

function initializeLazyLoading() {
    injectLazyLoadingStyles();
    lazyLoader = new LazyImageLoader();
    
    // Make it globally accessible for debugging
    window.lazyLoader = lazyLoader;
    
    console.log('Lazy loading system initialized');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
    initializeLazyLoading();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyImageLoader;
}

