import { Change, Enum, OldCustomer, OldPkg, OldVersion, Pkg, Release, Version } from "./types";

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
    changeListAccumulated.unshift(
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

function isVersionListCircular(versionList: Version[], index: number) {
    const versionFound = versionList.find((version) => version.index === index);
    if (!versionFound) {
      return false;
    }
    let v1: Version | undefined = versionFound;
    let { index: index1, indexPrev: indexPrev1 } = v1;
    let v2: Version | undefined = versionFound;
    let { index: index2, indexPrev: indexPrev2 } = v2;
    while (v1 || v2) {
      // eslint-disable-next-line no-loop-func
      v1 = versionList.find((version) => version.index === indexPrev1);
      if (!v1) {
        return false;
      }
      ({ index: index1, indexPrev: indexPrev1 } = v1);
      // eslint-disable-next-line no-loop-func
      v2 = versionList.find((version) => version.index === indexPrev2);
      if (!v2) {
        return false;
      }
      ({ index: index2, indexPrev: indexPrev2 } = v2);
      // eslint-disable-next-line no-loop-func
      v2 = versionList.find((version) => version.index === indexPrev2);
      if (!v2) {
        return false;
      }
      ({ index: index2, indexPrev: indexPrev2 } = v2);
      if (index1 === index2) {
        return true;
      }
    }
}

export function load(input: string) {
  const parsed = JSON.parse(input);
  const { versionList, lineupList, pkgList, customerList } = parsed;
  // Check if it comes from release-history-manager
  if (versionList[0] && versionList[0].versionIndex !== undefined) {
    // Migrate
    const versionListNew: Version[] = (versionList as OldVersion[]).map((version) => {
      const { versionIndex: index, versionName: name, versionIndexPrev: indexPrev, changeList, releaseList } = version;
      const changeListNew: Change[] = changeList.map((change) => {
        const { changeIndex: index, description, beforeChange, afterChange, targetCustomerList } = change;
        const customerIndexList = targetCustomerList.map((targetCustomer) => targetCustomer.customerIndex);
        return { index, description, beforeChange, afterChange, customerIndexList, lineupIndex: -1 };
      });
      const releaseListNew: Release[] = releaseList.map((release) => {
        const { releaseIndex: index, pkgIndex, targetCustomerList } = release;
        const customerIndexList = targetCustomerList.map((targetCustomer) => targetCustomer.customerIndex);
        return { index, pkgIndex, customerIndexList };
      })
      return {
        index,
        name,
        indexPrev,
        changeList: changeListNew,
        releaseList: releaseListNew,
      }
    });
    const pkgListNew: Pkg[] = (pkgList as OldPkg[]).map((pkg) => {
      const { pkgIndex: index, pkgName: name } = pkg;
      return { index, name, lineupIndex: -1 };
    });
    const customerListNew: Enum[] = (customerList as OldCustomer[]).map((customer) => {
      const { customerIndex: index, customerName: name } = customer;
      return { index, name };
    });
    return { versionList: versionListNew, lineupList: [], pkgList: pkgListNew, customerList: customerListNew };
  } else {
    // TODO: Check validity
  }
  return { versionList, lineupList, pkgList, customerList };
}

export function publish(versionList: Version[], versionIndex: number, lineupList: Enum[], pkgList: Pkg[], customerList: Enum[]) {
  if (isVersionListCircular(versionList, versionIndex)) {
    return;
  }
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
  return releaseHistory;
}

function publishPerCustomer(versionList: Version[], versionIndex: number, lineupList: Enum[], pkgList: Pkg[], customer: Enum) {
  const candidateLineupIndexList = [-1, ...lineupList.map((lineup) => lineup.index)];
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
  return releaseHistory;
}

function publishPerLineup(versionList: Version[], versionIndex: number, lineupIndex: number, pkgList: Pkg[], customer: Enum) {
  let versionNext = versionList.find((version) => version.index === versionIndex);
  const { index: customerIndex } = customer;
  const changeListPerPkgList: ReleaseHistoryPerPkg[] = [];
  while(versionNext) {
    const { indexPrev, changeList, releaseList } = versionNext;
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
        changeListPerPkgList.unshift({ pkgName, changeList: changeListAccumulated });
      }
    }
  }
  const releaseHistory = changeListPerPkgList.map((changeListPerPkg, index) => {
    const { pkgName, changeList } = changeListPerPkg;
    const changes = index === 0 ? '- Initial release' : changeList.map((change) => {
      const { description, beforeChange, afterChange } = change;
      const listToChanges = [
        '[Description]',
        indent(description),
      ];
      if (beforeChange || afterChange) {
        listToChanges.push(('[Enhancement]'));
      }
      if (beforeChange) {
        listToChanges.push(indent('[Before change]'));
        listToChanges.push(indent(indent(beforeChange)));
      }
      if (afterChange) {
        listToChanges.push(indent('[After change]'));
        listToChanges.push(indent(indent(afterChange)));
      }
      return listToChanges.join('\n');
    }).join('\n');
    if (!changes) {
      return '';
    }
    return `${pkgName}
${indent(changes)}`
  }).filter((changes) => !!changes).join('\n').trim();
  return releaseHistory;
}
