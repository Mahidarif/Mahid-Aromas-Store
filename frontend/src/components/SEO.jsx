import { Helmet } from 'react-helmet-async';

/**
 * Reusable Dynamic SEO Component
 * Injects page-specific meta tags, Open Graph (WhatsApp, Facebook),
 * Twitter Cards, and canonical links.
 *
 * @param {Object} props
 * @param {string} [props.title] - Page title (will append ' | Mahid Aromas')
 * @param {string} [props.description] - Meta description
 * @param {string} [props.image] - Hero/Product image URL for social preview
 * @param {string} [props.url] - Canonical URL path (e.g. '/products/royal-oud')
 * @param {string} [props.type] - OG type ('website' | 'product')
 * @param {string} [props.keywords] - Comma separated SEO keywords
 * @param {Object} [props.productData] - Optional structured pricing data for products
 */
export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  productData,
}) {
  const siteTitle = 'Mahid Aromas';
  const defaultTitle = 'Mahid Aromas — Authentic Luxury Fragrances in Pakistan';
  const fullTitle = title ? `${title} | ${siteTitle}` : defaultTitle;

  const defaultDescription =
    'Discover rare, authentic luxury perfumes curated for the discerning. Shop Oud, Floral, Woody & Oriental fragrances with fast Pakistan-wide delivery.';
  const metaDescription = description || defaultDescription;

  // Resolve absolute image URL for social scrapers
  const defaultImage = '/hero-perfume.png';
  const rawImage = image || defaultImage;
  const metaImage = rawImage.startsWith('http')
    ? rawImage
    : typeof window !== 'undefined'
    ? `${window.location.origin}${rawImage}`
    : rawImage;

  const currentUrl =
    typeof window !== 'undefined'
      ? url
        ? `${window.location.origin}${url}`
        : window.location.href
      : url || '';

  const defaultKeywords =
    'luxury perfumes Pakistan, authentic fragrances, Oud perfume, designer perfume, buy perfume online, Mahid Aromas';
  const metaKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Standard HTML Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={title || siteTitle} />
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      <meta property="og:locale" content="en_PK" />

      {/* Product-specific Open Graph extensions */}
      {type === 'product' && productData && (
        <>
          {productData.price && (
            <meta property="product:price:amount" content={String(productData.price)} />
          )}
          <meta property="product:price:currency" content="PKR" />
          {productData.inStock !== undefined && (
            <meta
              property="product:availability"
              content={productData.inStock ? 'instock' : 'outofstock'}
            />
          )}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
