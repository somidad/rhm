import { Change, Enum, Pkg, Version } from "./types";

type ReleaseHistoryPerCustomerIndexList = {
  customerIndexList: number[];
  releaseHistory: string;
}

type ReleaseHistoryPerLineupIndex = {
  lineupIndex: number;
  releaseHistory: string;
}

type ReleaseHistoryPerPkg = {
  pkgName: string;
  changeList: Change[];
};

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

export function getEnumNameList(enumList: Enum[], indexList: number[]) {
  return enumList
    .filter((enumItem) => indexList.includes(enumItem.index))
    .map((enumItem) => enumItem.name);
}

function indent(input: string) {
  return input.replace(/^/gm, '    ');
}

export function publish(versionList: Version[], versionIndex: number, lineupList: Enum[], pkgList: Pkg[], customerList: Enum[]) {
  console.log('Publishing release history...');
  console.group();
  const releaseHistoryPerCustomerIndexListList: ReleaseHistoryPerCustomerIndexList[] = [];
  // Generate
  customerList.forEach((customer) => {
    releaseHistoryPerCustomerIndexListList.push({
      customerIndexList: [customer.index],
      releaseHistory: publishPerCustomer(versionList, versionIndex, lineupList, pkgList, customer),
    });
  });
  // Merge
  for (let i = releaseHistoryPerCustomerIndexListList.length - 1; i >= 0; i -= 1) {
    const { customerIndexList: cil1, releaseHistory: rh1 } = releaseHistoryPerCustomerIndexListList[i];
    for (let j = i - 1; j >= 0; j -= 1) {
      const { customerIndexList: cil2, releaseHistory: rh2 } = releaseHistoryPerCustomerIndexListList[j];
      if (rh1 === rh2) {
        cil2.push(...cil1);
        releaseHistoryPerCustomerIndexListList.splice(i, 1);
        break;
      }
    }
  }
  // Export
  const releaseHistory = releaseHistoryPerCustomerIndexListList
    .filter((relaseHistoryPerCustomerIndexList) => relaseHistoryPerCustomerIndexList.releaseHistory)
    .map((relaseHistoryPerCustomerIndexList) => {
      const { customerIndexList, releaseHistory } = relaseHistoryPerCustomerIndexList;
      const customerNameJoined = getEnumNameList(customerList, customerIndexList).join(', ');
      return `<${customerNameJoined}>
${indent(releaseHistory)}
</${customerNameJoined}>`;
    }).join('\n');
  console.groupEnd();
  return releaseHistory;
}

function publishPerCustomer(versionList: Version[], versionIndex: number, lineupList: Enum[], pkgList: Pkg[], customer: Enum) {
  const candidateLineupIndexList = [-1, ...lineupList.map((lineup) => lineup.index)];
  console.log(customer.name);
  console.group();
  const releaseHistoryPerLineupList: ReleaseHistoryPerLineupIndex[] = [];
  candidateLineupIndexList.forEach((lineupIndex) => {
    releaseHistoryPerLineupList.push({
      lineupIndex,
      releaseHistory: publishPerLineup(versionList, versionIndex, lineupIndex, pkgList, customer),
    });
  })
  const releaseHistory = releaseHistoryPerLineupList
    .filter((releaseHistoryPerLineup) => releaseHistoryPerLineup.releaseHistory)
    .map((releaseHistoryPerLineup) => {
      const { lineupIndex, releaseHistory } = releaseHistoryPerLineup;
      const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
      if (!lineupFound) {
        return indent(releaseHistory);
      } else {
        const lineupName = lineupFound.name;
        return `<${lineupName}>
${indent(releaseHistory)}
</${lineupName}>`;
      }
    }).join('\n');
  console.groupEnd();
  return releaseHistory;
}

function publishPerLineup(versionList: Version[], versionIndex: number, lineupIndex: number, pkgList: Pkg[], customer: Enum) {
  let versionNext = versionList.find((version) => version.index === versionIndex);
  const { index: customerIndex } = customer;
  const changeListPerPkgList: ReleaseHistoryPerPkg[] = [];
  while(versionNext) {
    const { name, indexPrev, changeList, releaseList } = versionNext;
    console.log(`Version: ${name}. Previous version: ${indexPrev}`);
    console.group();
    // Check the current version is released
    const releaseFound = releaseList.find((release) => {
      const customerIncluded = release.customerIndexList.includes(customerIndex);
      if (!customerIncluded) {
        return false;
      }
      const { pkgIndex } = release;
      const pkgFound = pkgList.find((pkg) => pkg.lineupIndex === lineupIndex && pkg.index === pkgIndex);
      return !!pkgFound;
    });
    console.log(releaseFound);
    // If the current version is not released, it is not for the given customer
    if (!releaseFound) {
      versionNext = undefined;
    } else {
      const { pkgIndex } = releaseFound;
      const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
      if (!pkgFound) {
        // This is not going to happen
        break;
      } else {
        const { name: pkgName, lineupIndex: pkgLineupIndex } = pkgFound;
        const changeListAccumulated = [
          ...changeList.filter((change) => {
            const { customerIndexList, lineupIndex: changeLineupIndex } = change;
            return (!customerIndexList.length || customerIndexList.includes(customerIndex))
                   && pkgLineupIndex === changeLineupIndex;
          }),
        ];
        // Accumulate unreleased versions and get the second latest released version
        versionNext = accumulateChangeList(changeListAccumulated, customerIndex, versionList, indexPrev);
        changeListPerPkgList.push({ pkgName, changeList: changeListAccumulated });
      }
    }
    console.groupEnd();
  }
  changeListPerPkgList.reverse();
  const releaseHistory = changeListPerPkgList.map((changeListPerPkg) => {
    const { pkgName, changeList } = changeListPerPkg;
    const changes = changeList.map((change) => {
      const { description, beforeChange, afterChange } = change;
      return `[Description]
${indent(description)}
[Before change]
${indent(beforeChange)}
[After change]
${indent(afterChange)}`;
    }).join('\n');
    return `${pkgName}
${indent(changes)}`
  }).join('\n');
  return releaseHistory;
}
