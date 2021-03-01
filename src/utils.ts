import { Change, Enum, Version } from "./types";

function accumulateChangeList(
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

export function publish(versionList: Version[], index: number, customerList: Enum[]) {
  let versionNext = versionList.find((version) => version.index === index);
  const releaseHistoryArr: string[] = [];
  const releaseHistoryPerCustomerMap = new Map();
  customerList.forEach((customer) => {
    const releaseHistoryArrPerCustomer = [];
    const { index: customerIndex } = customer;
    while(versionNext) {
      const { indexPrev, changeList, releaseList } = versionNext;
      // Check the current version is released
      const releaseFound = releaseList.find((release) => release.customerIndexList.includes(customerIndex));
      // If the current version is not released, find the second latest released version
      if (!releaseFound) {
        versionNext = versionList.find((version) => version.index === indexPrev);
        continue;
      }
      const { pkgIndex } = releaseFound;
      const changeListAccumulated = [
        ...changeList.filter((change) => {
          const { customerIndexList } = change;
          return !customerIndexList.length || customerIndexList.includes(customerIndex);
        }),
      ];
      // Accumulate unreleased versions and get the second latest released version
      versionNext = accumulateChangeList(changeListAccumulated, customerIndex, versionList, indexPrev);
      releaseHistoryArrPerCustomer.push({ pkgIndex, changeList: changeListAccumulated });
    }
    releaseHistoryPerCustomerMap.set(customerIndex, releaseHistoryArrPerCustomer.join('\n'));
  });
  return JSON.stringify(releaseHistoryPerCustomerMap, null, 2);
}
