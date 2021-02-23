import { useState } from "react";
import { Accordion, Breadcrumb, Icon } from "semantic-ui-react";
import { Version } from "../types";

type Props = {
  name: string;
  indexPrev: number;
  versionList: Version[];
};

export default function VersionComponent({ name, indexPrev, versionList }: Props) {
  const [active, setActive] = useState(false);
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
      <Accordion.Content active={active}></Accordion.Content>
    </>
  );
}
