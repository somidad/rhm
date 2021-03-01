import { Change, Enum, Version } from "./types";

type ReleaseHistoryPerCustomerIndexList = {
  customerIndexList: number[];
  releaseHistory: string;
}

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
  console.log('Publishing release history...');
  console.group();
  const releaseHistoryPerCustomerList: ReleaseHistoryPerCustomerIndexList[] = [];
  customerList.forEach((customer) => {
    console.log(customer.name);
    console.group();
    const releaseHistoryArrPerCustomer = [];
    const { index: customerIndex } = customer;
    let versionNext = versionList.find((version) => version.index === index);
    while(versionNext) {
      const { name, indexPrev, changeList, releaseList } = versionNext;
      console.log(`Version: ${name}. Previous version: ${indexPrev}`);
      console.group();
      // Check the current version is released
      const releaseFound = releaseList.find((release) => release.customerIndexList.includes(customerIndex));
      console.log(releaseFound);
      // If the current version is not released, it is not for the given customer
      if (!releaseFound) {
        versionNext = undefined;
      } else {
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
      console.groupEnd();
    }
    const releaseHistoryPerCustomer = releaseHistoryArrPerCustomer.join('\n');
    if (releaseHistoryPerCustomer) {
      releaseHistoryPerCustomerList.push({
        customerIndexList: [customerIndex],
        releaseHistory: releaseHistoryPerCustomer,
      });
    }
    console.groupEnd();
  });
  console.groupEnd();
  return JSON.stringify(releaseHistoryPerCustomerList, null, 2);
}
