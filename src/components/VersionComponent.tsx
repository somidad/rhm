import { useState } from "react";
import { Accordion, Breadcrumb, Icon } from "semantic-ui-react";
import { Enum, Pkg, Version } from "../types";
import ChangeTable from "./ChangeTable";
import ReleaseTable from "./ReleaseTable";

type Props = {
  index: number;
  versionList: Version[];
  pkgList: Pkg[];
  customerList: Enum[];
};

export default function VersionComponent({ index, versionList, pkgList, customerList }: Props) {
  const [active, setActive] = useState(true);
  const [activeChange, setActiveChange] = useState(true);
  const [activeRelease, setActiveRelease] = useState(true);

  const versionFound = versionList.find((version) => version.index === index);
  if (!versionFound) {
    return (
      <></>
    );
  }
  const { name, indexPrev, changeList, releaseList } = versionFound;
  const versionPrevFound = versionList.find((version) => version.index === indexPrev);

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
            <ChangeTable changeList={changeList} />
          </Accordion.Content>
          <Accordion.Title active={activeRelease} onClick={() => setActiveRelease(!activeRelease)}>
            <Icon name='dropdown' />
            Releases
          </Accordion.Title>
          <Accordion.Content active={activeRelease}>
            <ReleaseTable releaseList={releaseList} pkgList={pkgList} customerList={customerList} />
          </Accordion.Content>
        </Accordion>
      </Accordion.Content>
    </>
  );
}
