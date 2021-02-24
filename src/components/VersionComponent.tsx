import { useState } from "react";
import { Accordion, Breadcrumb, Icon } from "semantic-ui-react";
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
  const [active, setActive] = useState(true);
  const [activeChange, setActiveChange] = useState(true);
  const [activeRelease, setActiveRelease] = useState(true);

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
      <Accordion.Title
        active={active}
        onClick={() => setActive(!active)}
      >
        <Icon name='dropdown' />
        <Breadcrumb>
          <Breadcrumb.Section active>
            {name}
          </Breadcrumb.Section>
          {
            versionPrevFound ? (
              <>
                <Breadcrumb.Divider icon='left angle' />
                <Breadcrumb.Section>{versionPrevFound.name}</Breadcrumb.Section>
              </>
            ) : (
              <></>
            )
          }
        </Breadcrumb>
      </Accordion.Title>
      <Accordion.Content active={active}>
        <Accordion>
          <Accordion.Title active={activeChange} onClick={() => setActiveChange(!activeChange)}>
            <Icon name='dropdown' />
            Changes
          </Accordion.Title>
          <Accordion.Content active={activeChange}>
            <ChangeTable
              changeList={changeList} lineupList={lineupList} customerList={customerList}
              onChange={onChangeChangeList}
            />
          </Accordion.Content>
          <Accordion.Title active={activeRelease} onClick={() => setActiveRelease(!activeRelease)}>
            <Icon name='dropdown' />
            Releases
          </Accordion.Title>
          <Accordion.Content active={activeRelease}>
            <ReleaseTable
              releaseList={releaseList} lineupList={lineupList} pkgList={pkgList} customerList={customerList}
              onChange={onChangeReleaseList}
            />
          </Accordion.Content>
        </Accordion>
      </Accordion.Content>
    </>
  );
}
