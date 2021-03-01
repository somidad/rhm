import { Change, Version } from "./types";

export function accumulateChangeList(
  changeListAccumulated: Change[], customerIndex: number,
  versionList: Version[], indexPrev: number,
) {
  let versionNext = versionList.find((version) => version.index === indexPrev);
  while (versionNext) {
    if (!versionNext) {
      return versionNext;
    }
    const { indexPrev, changeList, releaseList } = versionNext;
    const releaseFound = releaseList.find((release) => release.customerIndexList.includes(customerIndex));
    if (releaseFound) {
      break;
    }
    changeListAccumulated.push(
      ...changeList.filter((change) => {
        const { customerIndexList } = change;
        return !customerIndexList.length || customerIndexList.includes(customerIndex);
      })
    );
    versionNext = versionList.find((version) => version.index === indexPrev);
  }
  return versionNext;
}

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
