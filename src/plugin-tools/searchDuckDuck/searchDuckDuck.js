import DDG from 'duck-duck-scrape';

(async () => {
  const searchResults = await DDG.search('node.js', {
    safeSearch: DDG.SafeSearchType.STRICT
  });

  console.log(searchResults);
})();