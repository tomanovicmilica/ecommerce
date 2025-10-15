import agent from './agent';

export interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'category' | 'page';
  url: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

// Static pages for search
const getStaticPages = (query: string): SearchResult[] => {
  const allPages: SearchResult[] = [
    {
      id: 'about',
      title: 'About Us',
      type: 'page' as const,
      url: '/about',
      description: 'Learn more about our company and mission'
    },
    {
      id: 'contact',
      title: 'Contact',
      type: 'page' as const,
      url: '/contact',
      description: 'Get in touch with our customer service team'
    },
    {
      id: 'catalog',
      title: 'Catalog',
      type: 'page' as const,
      url: '/catalog',
      description: 'Browse our complete product catalog'
    }
  ];

  return allPages.filter(page =>
    page.title.toLowerCase().includes(query.toLowerCase()) ||
    page.description?.toLowerCase().includes(query.toLowerCase())
  );
};

const searchAgent = {
  // Search function for the entire site
  searchAll: async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];

    try {
      // Get static page results
      const staticPages = getStaticPages(query);

      // Search products using the same parameters as catalog
      const params = new URLSearchParams();
      params.append('pageNumber', '1');
      params.append('pageSize', '5');
      params.append('orderBy', 'name');
      params.append('searchTerm', query);

      const response = await agent.Catalog.list(params);
      const productResults = response.items.map((product: any, index: number) => ({
        id: product.id?.toString() || `search-product-${index}`,
        title: product.name || 'Unknown Product',
        type: 'product' as const,
        url: `/catalog/${product.id || 0}`,
        description: product.description || '',
        price: product.price || 0,
        imageUrl: product.pictureUrl || ''
      }));

      // Combine all results, prioritizing products, then static pages
      const allResults = [...productResults, ...staticPages];

      // Limit total results to 8
      return allResults.slice(0, 8);

    } catch (error) {
      console.error('Search error:', error);
      // Return static page results as fallback
      return getStaticPages(query);
    }
  }
};

export default searchAgent;