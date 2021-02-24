export function findEmptyIndex(indexList: number[]) {
  return indexList
    .sort((a, b) => a - b)
    .reduce((indexPrev, index) => {
      if (index === indexPrev) {
        return indexPrev + 1;
      }
      return indexPrev;
    }, 0);
}
