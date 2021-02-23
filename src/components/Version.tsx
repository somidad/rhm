import { useState } from "react";
import { Accordion, Breadcrumb, Icon } from "semantic-ui-react";

type Props = {
  version: string;
};

export default function Version({ version }: Props) {
  const [active, setActive] = useState(false);

  return (
    <>
      <Accordion.Title
        active={active}
        onClick={() => setActive(!active)}
      >
        <Icon name='dropdown' />
        <Breadcrumb>
          <Breadcrumb.Section active>
            {version}
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon='left angle' />
          <Breadcrumb.Section>Previous version</Breadcrumb.Section>
        </Breadcrumb>
      </Accordion.Title>
      <Accordion.Content active={active}></Accordion.Content>
    </>
  );
}
