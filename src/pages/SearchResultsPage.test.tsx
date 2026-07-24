import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SearchResultsPage } from './SearchResultsPage';

vi.mock('../components/ads/AdSlot', () => ({
  AdSlot: () => <div data-testid="ad-slot" />,
}));

function renderSearchResults(path: string): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <SearchResultsPage />
    </MemoryRouter>,
  );
}

describe('SearchResultsPage', () => {
  it('shows high price as the selected default on the existing summer promotion', () => {
    const markup = renderSearchResults('/search?deal=summer');

    expect(markup).toContain(
      '<option value="priceHigh" selected="">높은 가격순</option>',
    );
  });

  it('keeps recommended as the selected default on other search pages', () => {
    const markup = renderSearchResults('/search?deal=summer-lastcall');

    expect(markup).toContain(
      '<option value="recommended" selected="">추천순</option>',
    );
  });
});
