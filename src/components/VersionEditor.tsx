import { useState } from "react";
import { Accordion, Button, Form, Segment } from "semantic-ui-react";
import { Enum, Pkg, Version } from "../types";
import { findEmptyIndex } from "../utils";
import VersionComponent from "./VersionComponent";

type Props = {
  versionList: Version[];
  onChange: (versionList: Version[]) => void;
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
};

export default function VersionEditor({ versionList, onChange, lineupList, pkgList, customerList }: Props) {
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
    const index = findEmptyIndex(versionList.map((version) => version.index));
    const versionListNew = [
      ...versionList,
      { index, name, indexPrev, changeList: [], releaseList: [] },
    ];
    onChange(versionListNew);
    setName('');
  }

  function onChangeVersion(version: Version) {
    const { index } = version;
    const indexFound = versionList.findIndex((version) => version.index === index);
    if (indexFound === -1) {
      return;
    }
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      version,
      ...versionList.slice(indexFound + 1),
    ];
    onChange(versionListNew);
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
              <VersionComponent key={index} version={version}
                versionList={versionList} lineupList={lineupList} pkgList={pkgList} customerList={customerList}
                onChange={onChangeVersion}
              />
            )
          })
        }
      </Accordion>
    </>
  );
}
