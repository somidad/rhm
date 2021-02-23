import { useState } from "react";
import { Accordion, Button, Form, Segment } from "semantic-ui-react";
import { Version } from "../types";
import VersionComponent from "./VersionComponent";

type Props = {
  versionList: Version[];
};

export default function VersionEditor({ versionList }: Props) {
  const [name, setName] = useState('');
  const [indexPrev, setIndexPrev] = useState(-1);

  return (
    <>
      <Segment>
        <Form>
          <Form.Group>
            <Form.Field inline>
              <label>Version</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Field>
            <Form.Field inline>
              <label>Previous version</label>
              <select value={indexPrev} onChange={(e) => setIndexPrev(+e.target.value)}>
                <option value={-1}>(None)</option>
                {
                  versionList.map((version) => {
                    const { index, name } = version;
                    return (
                      <option key={index} value={index}>{name}</option>
                    )
                  })
                }
              </select>
            </Form.Field>
            <Button icon='plus' size='tiny' />
          </Form.Group>
        </Form>
      </Segment>
      <Accordion fluid styled>
        {
          versionList.map((version) => {
            const { index, name, indexPrev } = version;
            return (
              <VersionComponent key={index} name={name} indexPrev={indexPrev} versionList={versionList} />
            )
          })
        }
      </Accordion>
    </>
  );
}
