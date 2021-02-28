import { Header } from "semantic-ui-react";
import { Change, Enum, Pkg, Release, Version } from "../types";
import ChangeTable from "./ChangeTable";
import ReleaseTable from "./ReleaseTable";

type Props = {
  version: Version;
  versionList: Version[];
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  onChange: (version: Version) => void;
};

export default function VersionComponent({
  version, versionList, lineupList, pkgList, customerList,
  onChange,
}: Props) {
  const { name, indexPrev, changeList, releaseList } = version;
  const versionPrevFound = versionList.find((version) => version.index === indexPrev);

  function onChangeChangeList(changeList: Change[]) {
    const { changeList: changeListOld, ...versionRest } = version;
    const versionNew = { ...versionRest, changeList };
    onChange(versionNew);
  }

  function onChangeReleaseList(releaseList: Release[]) {
    const { releaseList: releaseListOld, ...versionRest } = version;
    const versionNew = { ...versionRest, releaseList };
    onChange(versionNew);
  }

  return (
    <>
      <Header as='h2'>
        {name}
        <Header.Subheader>Previous version: {versionPrevFound ? versionPrevFound.name : '(None)'}</Header.Subheader>
      </Header>
      <Header as='h3'>
        Changes
      </Header>
      <ChangeTable
        changeList={changeList} lineupList={lineupList} customerList={customerList}
        onChange={onChangeChangeList}
      />
      <Header as='h3'>
        Releases
      </Header>
      <ReleaseTable
        releaseList={releaseList} lineupList={lineupList} pkgList={pkgList} customerList={customerList}
        onChange={onChangeReleaseList}
      />
    </>
  );
}
