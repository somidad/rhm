import { uniq } from "lodash";
import {
  Change,
  ChangeV2,
  Enum,
  OldCustomer,
  OldPkg,
  OldVersion,
  Pkg,
  Release,
  ReleaseV2,
  Version,
  VersionV2,
} from "./types";

type ReleaseHistoryPerCustomerIndexList = {
  customerIndexList: number[];
  releaseHistory: string;
};

type ReleaseHistoryPerLineupIndex = {
  lineupIndex: number;
  releaseHistory: string;
};

export function accumulateVersionIndex(
  versionList: VersionV2[],
  versionIndex: number
): number[] {
  const versionIndexList: number[] = [];
  const versionFound = versionList.find(
    (version) => version.index === versionIndex
  );
  if (!versionFound) {
    return versionIndexList;
  }
  versionIndexList.push(versionIndex);
  const { indexPrev } = versionFound;
  versionIndexList.push(...accumulateVersionIndex(versionList, indexPrev));
  return versionIndexList;
}

/**
 * Filter change list to accumulate after the previous package to the current package
 * The previous package and the current package may be released in the same version or different versions
 */
 function filterChangeListToAccumulate(
  customerIndex: number,
  versionList: VersionV2[],
  versionIndex: number,
  lineupIndex: number,
  pkgList: Pkg[],
) {
  console.group({customerIndex});
  const changeList: { pkgName: string; changeList: ChangeV2[]; }[] = [];
  let versionNext = versionList.find((version) => version.index === versionIndex);
  let pkgName = '';
  const changeListToAccumulate: ChangeV2[] = [];
  let initialVersion = true;
  while (versionNext) {
    console.group({versionNext});
    // Traverse the last release from the first release for each version
    // If a package is released to the customer,
    // - Push the accumulated change list with the package name, if package name is not empy
    // - Reset the accumulated change list
    // - Update the package name with the current package
    // Common
    // - Accumulate changes
    const { indexPrev, releaseList } = versionNext;
    // Check at least one package is released with the current version
    if (initialVersion) {
      const released = releaseList.find((release) => {
        const { pkgIndex, customerIndexList } = release;
        if (!customerIndexList.includes(customerIndex)) {
          return false;
        }
        const pkgFound = pkgList.find((pkg) => {
          return pkg.index === pkgIndex && pkg.lineupIndex === lineupIndex;
        });
        return !!pkgFound;
      });
      initialVersion = false;
      if (!released) {
        return changeList;
      }
    }
    for (let i = releaseList.length - 1; i >= 0; i -= 1) {
      const release = releaseList[i];
      const { customerIndexList, customerIndexListPerChangeList, pkgIndex } = release;
      const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
      console.log({customerIndexList});
      const customerFound = customerIndexList.findIndex((ci) => ci === customerIndex) !== -1;
      // Check if the package is with the desired lineup
      if (pkgFound?.lineupIndex !== lineupIndex) {
        continue;
      }
      if (customerFound) {
        if (pkgName) {
          console.log('Pushed', pkgName, changeListToAccumulate);
          // - Push the accumulated change list with the package name, if package name is not empy
          changeList.unshift({ pkgName, changeList: [...changeListToAccumulate] });
          // - Reset the accumulated change list
          changeListToAccumulate.length = 0;
        }
        // - Update the package name with the current package
        pkgName = pkgFound?.name ?? '';
      }
      // - Accumulate changes
      const chagneIndexListToAccumultate = customerIndexListPerChangeList.filter((item) => {
        const { customerIndexList } = item;
        return customerIndexList.includes(customerIndex) || customerIndexList.includes(-1);
      });
      const changeListToAccumulatePerRelease = versionList.map((version) => {
        const { changeList: changeListPerVersion } = version;
        const changeListToAccumulatePerVersion = changeListPerVersion.filter((change) => {
          const { lineupIndex } = change;
          return chagneIndexListToAccumultate.find(
            (item) =>
            item.versionIndex === version.index &&
            item.changeIndex === change.index &&
            change.lineupIndex === lineupIndex
          );
        });
        return changeListToAccumulatePerVersion;
      }).flat();
      changeListToAccumulate.unshift(...changeListToAccumulatePerRelease);
      console.log({changeListToAccumulate});
    }
    versionNext = versionList.find((version) => version.index === indexPrev);
    console.groupEnd();
  }
  if (pkgName) {
    console.log('Pushed', pkgName, changeListToAccumulate);
    // - Push the accumulated change list with the package name, if package name is not empy
    changeList.unshift({ pkgName, changeList: [...changeListToAccumulate] });
  }
  console.groupEnd();
  return changeList;
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
  return input.replace(/^/gm, "    ");
}

function isVersionListCircular(versionList: VersionV2[], index: number) {
  const versionFound = versionList.find((version) => version.index === index);
  if (!versionFound) {
    return false;
  }
  let v1: VersionV2 | undefined = versionFound;
  let { index: index1, indexPrev: indexPrev1 } = v1;
  let v2: VersionV2 | undefined = versionFound;
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
    const versionListNew: Version[] = (versionList as OldVersion[]).map(
      (version) => {
        const {
          versionIndex: index,
          versionName: name,
          versionIndexPrev: indexPrev,
          changeList,
          releaseList,
        } = version;
        const changeListNew: Change[] = changeList.map((change) => {
          const {
            changeIndex: index,
            description,
            beforeChange,
            afterChange,
            targetCustomerList,
          } = change;
          const customerIndexList = targetCustomerList.map(
            (targetCustomer) => targetCustomer.customerIndex
          );
          return {
            index,
            description,
            beforeChange,
            afterChange,
            customerIndexList,
            lineupIndex: -1,
          };
        });
        const releaseListNew: Release[] = releaseList.map((release) => {
          const { releaseIndex: index, pkgIndex, targetCustomerList } = release;
          const customerIndexList = targetCustomerList.map(
            (targetCustomer) => targetCustomer.customerIndex
          );
          return { index, pkgIndex, customerIndexList };
        });
        return {
          index,
          name,
          indexPrev,
          changeList: changeListNew,
          releaseList: releaseListNew,
        };
      }
    );
    const pkgListNew: Pkg[] = (pkgList as OldPkg[]).map((pkg) => {
      const { pkgIndex: index, pkgName: name } = pkg;
      return { index, name, lineupIndex: -1 };
    });
    const customerListNew: Enum[] = (customerList as OldCustomer[]).map(
      (customer) => {
        const { customerIndex: index, customerName: name } = customer;
        return { index, name };
      }
    );
    return {
      versionList: versionListNew,
      lineupList: [],
      pkgList: pkgListNew,
      customerList: customerListNew,
    };
  } else {
    // TODO: Check validity
  }
  // Migrate from rhm v1 to v2
  versionList.forEach((version: Version & VersionV2) => {
    const { index: versionIndex, changeList, releaseList } = version;
    releaseList.forEach((release: Release & ReleaseV2) => {
      release.customerIndexListPerChangeList = release.customerIndexListPerChangeList ?? [];
    });
    changeList.forEach((change: Change & ChangeV2) => {
      const { index: changeIndex, customerIndexList } = change;
      if (customerIndexList && customerIndexList.length) {
        customerIndexList.forEach((customerIndex) => {
          const releaseFound = releaseList.find((release) => {
            const { pkgIndex } = release;
            return (pkgList as Pkg[]).find((pkg) => {
              return (
                pkg.index === pkgIndex && pkg.lineupIndex === change.lineupIndex &&
                release.customerIndexList.includes(customerIndex)
              );
            });
          });
          if (releaseFound) {
            const { customerIndexListPerChangeList } = releaseFound as ReleaseV2;
            const customerIndexListPerChangeFound = customerIndexListPerChangeList.find((item) => {
              return item.versionIndex === versionIndex && item.changeIndex === changeIndex;
            });
            if (customerIndexListPerChangeFound) {
              customerIndexListPerChangeFound.customerIndexList = uniq([
                ...customerIndexListPerChangeFound.customerIndexList,
                customerIndex,
              ]);
            } else {
              customerIndexListPerChangeList.push({
                versionIndex, changeIndex, customerIndexList: [customerIndex],
              });
            }
          }
        });
      } else if (customerIndexList && !customerIndexList.length) {
        // Global
        const releaseFound = releaseList.find((release) => {
          const { pkgIndex } = release;
          return (pkgList as Pkg[]).find((pkg) => {
            return (
              pkg.index === pkgIndex && pkg.lineupIndex === change.lineupIndex
            );
          });
        });
        if (releaseFound) {
          const { customerIndexListPerChangeList } = releaseFound as ReleaseV2;
          const customerIndexListPerChangeFound = customerIndexListPerChangeList.find((item) => {
            return item.versionIndex === versionIndex && item.changeIndex === changeIndex;
          });
          if (customerIndexListPerChangeFound) {
            customerIndexListPerChangeFound.customerIndexList = [-1];
          } else {
            customerIndexListPerChangeList.push({
              versionIndex, changeIndex, customerIndexList: [-1],
            });
          }
        }
      }
    });
  });
  // TODO
  return { versionList, lineupList, pkgList, customerList };
}

export function publish(
  versionList: VersionV2[],
  versionIndex: number,
  lineupList: Enum[],
  pkgList: Pkg[],
  customerList: Enum[]
) {
  if (isVersionListCircular(versionList, versionIndex)) {
    return;
  }
  const releaseHistoryPerCustomerIndexListList: ReleaseHistoryPerCustomerIndexList[] =
    [];
  // Generate
  customerList.forEach((customer) => {
    releaseHistoryPerCustomerIndexListList.push({
      customerIndexList: [customer.index],
      releaseHistory: publishPerCustomer(
        versionList,
        versionIndex,
        lineupList,
        pkgList,
        customer
      ),
    });
  });
  // Merge
  for (
    let i = releaseHistoryPerCustomerIndexListList.length - 1;
    i >= 0;
    i -= 1
  ) {
    const { customerIndexList: cil1, releaseHistory: rh1 } =
      releaseHistoryPerCustomerIndexListList[i];
    for (let j = i - 1; j >= 0; j -= 1) {
      const { customerIndexList: cil2, releaseHistory: rh2 } =
        releaseHistoryPerCustomerIndexListList[j];
      if (rh1 === rh2) {
        cil2.push(...cil1);
        releaseHistoryPerCustomerIndexListList.splice(i, 1);
        break;
      }
    }
  }
  // Export
  const releaseHistory = releaseHistoryPerCustomerIndexListList
    .filter(
      (relaseHistoryPerCustomerIndexList) =>
        relaseHistoryPerCustomerIndexList.releaseHistory
    )
    .map((relaseHistoryPerCustomerIndexList) => {
      const { customerIndexList, releaseHistory } =
        relaseHistoryPerCustomerIndexList;
      const customerNameJoined = getEnumNameList(
        customerList,
        customerIndexList
      ).join(", ");
      return `<${customerNameJoined}>
${indent(releaseHistory)}
</${customerNameJoined}>`;
    })
    .join("\n");
  return releaseHistory;
}

function publishPerCustomer(
  versionList: VersionV2[],
  versionIndex: number,
  lineupList: Enum[],
  pkgList: Pkg[],
  customer: Enum
) {
  const candidateLineupIndexList = [-1, ...lineupList.map((lineup) => lineup.index)];
  const releaseHistoryPerLineupList: ReleaseHistoryPerLineupIndex[] = [];
  candidateLineupIndexList.forEach((lineupIndex) => {
    releaseHistoryPerLineupList.push({
      lineupIndex,
      releaseHistory: publishPerLineup(
        versionList,
        versionIndex,
        lineupIndex,
        pkgList,
        customer
      ),
    });
  });
  const releaseHistory = releaseHistoryPerLineupList
    .filter((releaseHistoryPerLineup) => releaseHistoryPerLineup.releaseHistory)
    .map((releaseHistoryPerLineup) => {
      const { lineupIndex, releaseHistory } = releaseHistoryPerLineup;
      const lineupFound = lineupList.find(
        (lineup) => lineup.index === lineupIndex
      );
      if (!lineupFound) {
        return indent(releaseHistory);
      } else {
        const lineupName = lineupFound.name;
        return `<${lineupName}>
${indent(releaseHistory)}
</${lineupName}>`;
      }
    })
    .join("\n");
  return releaseHistory;
}

function publishPerLineup(
  versionList: VersionV2[],
  versionIndex: number,
  lineupIndex: number,
  pkgList: Pkg[],
  customer: Enum
) {
  const { index: customerIndex } = customer;
  const changeListPerPkgList = filterChangeListToAccumulate(
    customerIndex,
    versionList,
    versionIndex,
    lineupIndex,
    pkgList,
  );
  const releaseHistory = changeListPerPkgList
    .map((changeListPerPkg, index) => {
      const { pkgName, changeList } = changeListPerPkg;
      const changes =
        index === 0
          ? "- Initial release"
          : changeList
              .map((change) => {
                const { description, beforeChange, afterChange } = change;
                const listToChanges = ["[Description]", indent(description)];
                if (beforeChange || afterChange) {
                  listToChanges.push("[Enhancement]");
                }
                if (beforeChange) {
                  listToChanges.push(indent("[Before change]"));
                  listToChanges.push(indent(indent(beforeChange)));
                }
                if (afterChange) {
                  listToChanges.push(indent("[After change]"));
                  listToChanges.push(indent(indent(afterChange)));
                }
                return listToChanges.join("\n");
              })
              .join("\n");
      if (!changes) {
        return "";
      }
      return `${pkgName}
${indent(changes)}`;
    })
    .filter((changes) => !!changes)
    .join("\n")
    .trim();
  return releaseHistory;
}
