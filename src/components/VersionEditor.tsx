import { useState } from "react";
import { Accordion, Button, Form, Segment } from "semantic-ui-react";
import { Enum, Pkg, Version } from "../types";
import VersionComponent from "./VersionComponent";

type Props = {
  versionList: Version[];
  onChange: (versionList: Version[]) => void;
  pkgList: Pkg[];
  customerList: Enum[];
};

export default function VersionEditor({ versionList, onChange, pkgList, customerList }: Props) {
  const [name, setName] = useState('');
  const [indexPrev, setIndexPrev] = useState(-1);

  function addVersion() {
    if (!name) {
      return;
    }
    const versionFound = versionList.find((version) => version.name === name);
    if (versionFound) {
      return;
    }
    const index = versionList.reduce((indexPrev, version) => {
      if (version.index === indexPrev) {
        return indexPrev + 1;
      }
      return indexPrev;
    }, 0);
    const versionListNew = [
      ...versionList,
      { index, name, indexPrev, changeList: [], releaseList: [] },
    ];
    onChange(versionListNew);
    setName('');
  }

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
            <Button icon='plus' size='tiny' onClick={addVersion} />
          </Form.Group>
        </Form>
      </Segment>
      <Accordion fluid styled>
        {
          versionList.map((version) => {
            const { index } = version;
            return (
              <VersionComponent key={index} index={index} versionList={versionList} pkgList={pkgList} customerList={customerList} />
            )
          })
        }
      </Accordion>
    </>
  );
}
