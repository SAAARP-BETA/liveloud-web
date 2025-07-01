export const API_BASE_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || 'http://localhost:3006/api';


export const searchService = {
  async globalSearch(query, type = 'all', page = 1, limit = 10) {
    const params = new URLSearchParams({
      query,
      type,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    return response.json();
  },

  async getSuggestions(query) {
    const params = new URLSearchParams({ query });
    const response = await fetch(`${API_BASE_URL}/suggestions?${params}`);
    
    if (!response.ok) {
      throw new Error(`Suggestions failed: ${response.status}`);
    }
    
    return response.json();
  }
};