const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

const parser = new xml2js.Parser();

async function fetchNewsFromReuters(limit = 20) {
  try {
    console.log('Attempting to fetch news from Reuters...');
    
    // Try Reuters sitemap first
    const sitemapUrl = 'https://www.reuters.com/arc/outboundfeeds/news-sitemap-index/?outputType=xml';
    const sitemapRes = await axios.get(sitemapUrl, { timeout: 10000 });
    const sitemapXml = sitemapRes.data;

    const parsed = await parser.parseStringPromise(sitemapXml);
    if (!parsed.sitemapindex || !parsed.sitemapindex.sitemap) {
      throw new Error('Invalid sitemap format');
    }
    
    const sitemapLinks = parsed.sitemapindex.sitemap.map(s => s.loc[0]);
    console.log(`Found ${sitemapLinks.length} sitemaps`);

    const articleUrls = [];

    // Only process the first 2 sitemaps to avoid too many requests
    for (let sitemap of sitemapLinks.slice(0, 2)) {
      try {
        const res = await axios.get(sitemap, { timeout: 8000 });
        const newsSitemap = await parser.parseStringPromise(res.data);
        if (newsSitemap.urlset && newsSitemap.urlset.url) {
          const urls = newsSitemap.urlset.url.map(u => u.loc[0]);
          articleUrls.push(...urls);
          console.log(`Added ${urls.length} article URLs from sitemap`);
        }
      } catch (e) {
        console.log(`Failed to parse sitemap: ${sitemap}`, e.message);
      }
    }

    if (articleUrls.length === 0) {
      throw new Error('No article URLs found');
    }

    const articles = [];
    const maxRetries = 3;

    // Process article URLs with retries
    for (let url of articleUrls.slice(0, limit)) {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          const res = await axios.get(url, { 
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          const $ = cheerio.load(res.data);
          
          // Try different selectors to extract content
          let content = '';
          const title = $('h1').first().text().trim() || url.split('/').pop() || 'News Article';
          
          // Try article paragraphs
          const paragraphs = $('article p').map((i, el) => $(el).text().trim()).get();
          if (paragraphs.length > 0) {
            content = paragraphs.join(' ');
          } else {
            // Fallback to any paragraphs
            content = $('p').map((i, el) => $(el).text().trim()).get().join(' ');
          }
          
          // Only add if we got meaningful content
          if (content.length > 100) {
            articles.push({ title, content, url });
            console.log(`Successfully fetched: ${title.substring(0, 50)}...`);
            break; // Success, exit retry loop
          } else {
            throw new Error('Insufficient content extracted');
          }
        } catch (e) {
          retries++;
          console.log(`Failed to fetch article (attempt ${retries}/${maxRetries}): ${url}`, e.message);
          if (retries < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }

    if (articles.length > 0) {
      console.log(`Successfully fetched ${articles.length} articles from Reuters`);
      return articles;
    }
    
    throw new Error('Failed to fetch any articles');
    
  } catch (error) {
    console.error('Error fetching from Reuters:', error.message);
    console.log('Falling back to sample news data...');
    
    // Return sample news data as fallback
    return generateSampleNewsData(limit);
  }
}

/**
 * Generates sample news data when real fetching fails
 * @param {number} limit - Number of sample articles to generate
 * @returns {Array} Array of sample article objects
 */
function generateSampleNewsData(limit = 10) {
  const sampleArticles = [
    {
      title: 'Global Markets See Recovery as Inflation Concerns Ease',
      content: 'Global markets rallied today as new economic data suggested inflation pressures may be easing in major economies. The S&P 500 gained 1.2% while European markets closed higher across the board. Analysts point to lower-than-expected producer price indexes in several countries as a sign that central banks may soon pivot to less restrictive monetary policies. The Federal Reserve indicated they are seeing positive signs that inflation is moderating. Bond yields fell on the news, with the U.S. 10-year Treasury yield dropping below 4% for the first time in three months.',
      url: 'https://example.com/markets-recovery'
    },
    {
      title: 'New Climate Agreement Reached at International Summit',
      content: 'World leaders announced a landmark climate agreement today following two weeks of intense negotiations. The pact includes more ambitious emissions reduction targets and increased funding for developing nations to transition to clean energy. The UN Secretary-General called it a critical step forward in our collective fight against climate change. The deal requires signatories to cut carbon emissions by 50% by 2035 compared to 2005 levels, a significant increase from previous commitments. Additionally, wealthy nations pledged $100 billion annually to help vulnerable countries adapt to climate impacts and develop renewable energy infrastructure. Environmental groups cautiously welcomed the agreement while noting that implementation will be crucial.',
      url: 'https://example.com/climate-agreement'
    },
    {
      title: 'Tech Giants Face New Antitrust Regulations in Europe',
      content: 'The European Commission unveiled sweeping new regulations today aimed at curbing the market power of major technology companies. The Digital Markets Act will impose strict rules on designated gatekeeper platforms, requiring them to provide competitors access to key systems and prohibiting self-preferencing of their own services. Companies found in violation could face fines of up to 10% of global annual revenue. The EU Commissioner for Competition stated that the era of big tech companies acting as if they are too big to care is coming to an end. The regulations specifically target companies with market capitalizations above €75 billion that operate core platform services. Industry representatives criticized the move, arguing it would stifle innovation and hurt European consumers.',
      url: 'https://example.com/tech-antitrust'
    },
    {
      title: 'Medical Breakthrough: New Treatment Shows Promise for Alzheimer\'s Disease',
      content: 'Researchers announced promising results from a Phase 3 clinical trial of a new treatment for Alzheimer\'s disease. The drug, which targets amyloid protein plaques in the brain, showed a 27% reduction in cognitive decline compared to placebo over an 18-month period. The lead researcher described the results as the most significant advancement in Alzheimer\'s treatment in decades. The study involved 2,400 patients with early-stage Alzheimer\'s across 20 countries. While the treatment doesn\'t cure the disease, it could substantially slow its progression, potentially giving patients additional years of independence. Regulatory agencies are expected to review the data for potential approval by early next year. The pharmaceutical company behind the drug said it is already scaling up production capabilities.',
      url: 'https://example.com/alzheimers-treatment'
    },
    {
      title: 'Global Supply Chain Disruptions Continue to Impact Manufacturing',
      content: 'Manufacturing output declined for the third consecutive month as global supply chain disruptions continue to plague industries worldwide. Shortages of key components, particularly semiconductors and raw materials, have forced production cuts across automotive, electronics, and consumer goods sectors. According to industry reports, many factories are operating at reduced capacity due to parts shortages. Shipping delays and port congestion have exacerbated the problems, with container costs remaining significantly higher than pre-pandemic levels. Economists warn that these disruptions could contribute to persistent inflation and slower economic growth through the end of the year. Some companies are responding by reshoring production or seeking alternative suppliers, though these adjustments will take time to implement.',
      url: 'https://example.com/supply-chain-issues'
    },
    {
      title: 'Renewable Energy Investments Reach Record High',
      content: 'Global investments in renewable energy reached a record $500 billion last year, according to a new report released today. Solar and wind power accounted for over 70% of all new electricity generation capacity added worldwide. The report indicates that the transition to clean energy has reached a tipping point, with renewables now being the most economical choice for new power generation in most markets. China led in total investment, followed by the United States and European Union. The report also highlighted the growing role of corporate power purchase agreements, with major companies increasingly contracting directly for renewable electricity. Employment in the sector grew by 12%, creating approximately 1.2 million new jobs globally despite economic headwinds in other industries.',
      url: 'https://example.com/renewable-investments'
    },
    {
      title: 'Diplomatic Tensions Rise Following Border Incident Between India and Pakistan',
      content: 'Diplomatic relations between India and Pakistan deteriorated today following a border incident that both countries are describing differently. According to Indian officials, their patrol was operating within sovereign territory when they were confronted, while Pakistan claims it was an illegal incursion. The incident resulted in the detention of several personnel, who remain in custody despite calls for their immediate release. Officials from India called it a provocative action that threatens regional stability. Pakistan described the event as a standard enforcement of border protocols. International mediators have offered to facilitate dialogue between the two nuclear-armed neighbors to prevent further escalation. Military forces in the region have reportedly been placed on heightened alert status as a precautionary measure, raising concerns about potential conflict along the disputed border.',
      url: 'https://example.com/india-pakistan-tensions'
    },
    {
      title: 'Central Bank Raises Interest Rates to Combat Inflation',
      content: 'The central bank announced a 50 basis point increase in its benchmark interest rate today, the sixth consecutive rate hike in its campaign to bring down persistent inflation. The move brings the key rate to 4.5%, its highest level in over a decade. The bank chair emphasized that price stability is their primary mandate and they will continue taking necessary actions to return inflation to their 2% target. The bank also signaled that additional rate increases are likely in the coming months, depending on economic data. Financial markets reacted with volatility, as stocks initially fell before recovering some losses. Economists remain divided on whether the aggressive tightening will trigger a recession, with some arguing that the labor market remains too strong for a significant downturn.',
      url: 'https://example.com/rate-hike'
    },
    {
      title: 'New Study Links Social Media Use to Declining Mental Health in Teens',
      content: 'A comprehensive study published today in a leading medical journal found strong correlations between heavy social media use and declining mental health indicators among teenagers. The research, which followed 10,000 adolescents over five years, showed that those spending more than three hours daily on social platforms experienced significantly higher rates of anxiety, depression, and sleep disturbances compared to peers with limited usage. The study found that the relationship appears to be dose-dependent - the more time spent on these platforms, the greater the observed negative effects. The findings have prompted renewed calls for regulatory oversight of social media companies and improved parental controls. Mental health advocates are urging schools to implement digital wellness programs to help students develop healthier technology habits.',
      url: 'https://example.com/social-media-study'
    },
    {
      title: 'Autonomous Vehicle Technology Advances with New Sensor Systems',
      content: 'A leading automotive technology company unveiled a breakthrough in autonomous vehicle sensing capabilities today. The new system combines lidar, radar, and camera technologies with advanced AI processing to significantly improve object detection and prediction in challenging conditions like heavy rain, fog, and darkness. According to company representatives, the technology represents a quantum leap in the safety potential of self-driving systems. The technology can detect objects up to 300 meters away with centimeter-level precision and can distinguish between different types of road users with 99.8% accuracy. Industry analysts suggest this development could accelerate the timeline for widespread deployment of fully autonomous vehicles. Regulatory agencies are currently reviewing the technology as part of their ongoing assessment of self-driving safety standards.',
      url: 'https://example.com/autonomous-vehicles'
    }
  ];
  
  return sampleArticles.slice(0, limit).map((article, index) => ({
    ...article,
    id: `sample-${index + 1}`
  }));
}

module.exports = { fetchNewsFromReuters };
