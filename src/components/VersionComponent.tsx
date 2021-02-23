import { useState } from "react";
import { Accordion, Breadcrumb, Icon, Item } from "semantic-ui-react";
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
      <Accordion.Content active={active}>
        <Accordion>
          <Accordion.Title active>
            <Icon name='dropdown' />
            Changes
          </Accordion.Title>
          <Accordion.Content active>
            <Item.Group divided>
              <Item>
                <Item.Content>
                  <Item.Meta>Description</Item.Meta>
                  <Item.Description>
                    Before change<br />
                    After change
                  </Item.Description>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Meta>Description</Item.Meta>
                  <Item.Description>
                    Before change<br />
                    After change
                  </Item.Description>
                </Item.Content>
              </Item>
            </Item.Group>
          </Accordion.Content>
          <Accordion.Title active>
            <Icon name='dropdown' />
            Releases
          </Accordion.Title>
          <Accordion.Content active>
            <Item.Group divided>
              <Item>
                <Item.Content>
                  <Item.Header>PKG</Item.Header>
                  <Item.Meta>Customer</Item.Meta>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Header>PKG</Item.Header>
                  <Item.Meta>Customer</Item.Meta>
                </Item.Content>
              </Item>
            </Item.Group>
          </Accordion.Content>
        </Accordion>
      </Accordion.Content>
    </>
  );
}
