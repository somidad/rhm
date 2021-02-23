import { useState } from "react";
import { Accordion, Breadcrumb, Icon, Item } from "semantic-ui-react";
import { Version } from "../types";

type Props = {
  index: number;
  versionList: Version[];
};

export default function VersionComponent({ index, versionList }: Props) {
  const [active, setActive] = useState(false);
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
          <Accordion.Title active>
            <Icon name='dropdown' />
            Changes
          </Accordion.Title>
          <Accordion.Content active>
            <Item.Group divided>
              {
                changeList.map((change) => {
                  const { index, description, beforeChange, afterChange, customerIndexList } = change;
                  return (
                    <Item key={index}>
                      <Item.Content>
                        <Item.Meta>{description}</Item.Meta>
                        <Item.Description>
                          <div>Before change</div>
                          <div dangerouslySetInnerHTML={{ __html: beforeChange.replace('\n', '<br />')}}></div>
                          <div>After change</div>
                          <div dangerouslySetInnerHTML={{ __html: afterChange.replace('\n', '<br />')}}></div>
                        </Item.Description>
                        <Item.Extra>{customerIndexList.join(', ')}</Item.Extra>
                      </Item.Content>
                    </Item>
                  )
                })
              }
            </Item.Group>
          </Accordion.Content>
          <Accordion.Title active>
            <Icon name='dropdown' />
            Releases
          </Accordion.Title>
          <Accordion.Content active>
            <Item.Group divided>
              {
                releaseList.map((release) => {
                  const { index, pkgIndex, customerIndexList } = release;
                  return (
                    <Item key={index}>
                      <Item.Content>
                        <Item.Header>{pkgIndex}</Item.Header>
                        <Item.Meta>{customerIndexList.join(', ')}</Item.Meta>
                      </Item.Content>
                    </Item>
                  );
                })
              }
            </Item.Group>
          </Accordion.Content>
        </Accordion>
      </Accordion.Content>
    </>
  );
}
