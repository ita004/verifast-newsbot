const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Fetches news articles from BBC RSS feed
 * @param {number} limit - Maximum number of articles to fetch
 * @returns {Promise<Array>} Array of article objects
 */
async function fetchFromRSS(limit = 10) {
  try {
    console.log('Fetching news from BBC RSS feed...');
    
    // List of RSS feeds to try
    const feeds = [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://feeds.bbci.co.uk/news/business/rss.xml',
      'https://feeds.bbci.co.uk/news/technology/rss.xml',
      'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
      'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'
    ];
    
    let allArticles = [];
    
    // Fetch articles from multiple feeds
    for (const feedUrl of feeds) {
      try {
        console.log(`Fetching from ${feedUrl}...`);
        const feed = await parser.parseURL(feedUrl);
        
        const articles = feed.items.map((item, i) => ({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || item.description || `News article about ${item.title}`,
          url: item.link,
          id: `rss-${feedUrl.split('/').slice(-2)[0]}-${i}`
        }));
        
        console.log(`Got ${articles.length} articles from ${feedUrl}`);
        allArticles = [...allArticles, ...articles];
      } catch (error) {
        console.error(`Error fetching from ${feedUrl}:`, error.message);
      }
    }
    
    // Ensure we have content for each article
    const validArticles = allArticles.filter(article => 
      article.title && 
      article.content && 
      article.content.length > 50
    );
    
    console.log(`Total valid articles: ${validArticles.length}`);
    
    if (validArticles.length === 0) {
      throw new Error('No valid articles found in RSS feeds');
    }
    
    // Return limited number of articles
    return validArticles.slice(0, limit);
    
  } catch (error) {
    console.error('Error fetching from RSS:', error.message);
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

module.exports = { fetchFromRSS };
