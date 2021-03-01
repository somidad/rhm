import { useState } from "react";
import { Button, Form, Icon, Modal, Table, TextArea } from "semantic-ui-react";
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
  const [editIndex, setEditIndex] = useState(-1);
  const [nameNew, setNameNew] = useState('');
  const [indexPrevNew, setIndexPrevNew] = useState(-1);
  const [openModal, setOpenModal] = useState(false);
  const [releaseHistory, setReleaseHistory] = useState('');

  const [index, setIndex] = useState<number>();

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

  function onClickEdit(index: number) {
    const versionFound = versionList.find((version) => version.index === index);
    if (!versionFound) {
      return;
    }
    setNameNew(versionFound.name);
    setIndexPrevNew(versionFound.indexPrev);
    setEditIndex(versionFound.index);
  }

  function onSubmitEditVersion() {
    if (!nameNew) {
      return;
    }
    const versionFound = versionList.find((version) => version.index !== editIndex && version.name === nameNew);
    if (versionFound) {
      return;
    }
    const indexFound = versionList.findIndex((version) => version.index === editIndex);
    if (indexFound === -1) {
      return;
    }
    const { changeList, releaseList } = versionList[indexFound];
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      {
        index: editIndex,
        name: nameNew,
        indexPrev: indexPrevNew,
        changeList,
        releaseList,
      },
      ...versionList.slice(indexFound + 1),
    ];
    onChange(versionListNew);
    setEditIndex(-1);
  }

  function publish(index: number) {
    // TODO
    setOpenModal(true);
  }

  function removeVersion(index: number) {
    const indexFound = versionList.findIndex((version) => version.index === index);
    if (indexFound === -1) {
      return;
    }
    const versionListNew = [
      ...versionList.slice(0, indexFound),
      ...versionList.slice(indexFound + 1),
    ];
    onChange(versionListNew);
  }

  const version = index === undefined ? versionList[0] : versionList.find((version) => version.index === index);
  return (
    <>
      <Table celled compact selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Version</Table.HeaderCell>
            <Table.HeaderCell>Previous version</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row active>
            <Table.Cell>
              <Form>
                <Form.Field disabled={editIndex !== -1}>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </Form.Field>
              </Form>
            </Table.Cell>
            <Table.Cell>
              <Form>
                <Form.Field disabled={editIndex !== -1}>
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
              </Form>
            </Table.Cell>
            <Table.Cell>
              <Button icon='plus' size='tiny' onClick={addVersion} disabled={editIndex !== -1} />
            </Table.Cell>
          </Table.Row>
          {
            versionList.map((version) => {
              const { index, name, indexPrev } = version;
              if (index === editIndex) {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>
                      <Form>
                        <Form.Field>
                          <input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                        </Form.Field>
                      </Form>
                    </Table.Cell>
                    <Table.Cell>
                      <Form>
                        <Form.Field>
                          <select value={indexPrevNew} onChange={(e) => setIndexPrevNew(+e.target.value)}>
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
                      </Form>
                    </Table.Cell>
                    <Table.Cell>
                      <Button icon='check' size='tiny' onClick={onSubmitEditVersion} />
                      <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                    </Table.Cell>
                  </Table.Row>
                )
              }
              const versionPrevFound = versionList.find((version) => version.index === indexPrev);
              const namePrev = versionPrevFound ? versionPrevFound.name : '(None)';
              const versionReferringFound = !!versionList.find((version) => version.indexPrev === index);
              return (
                <Table.Row key={index}>
                  <Table.Cell>
                    <button className='a-like-button' onClick={() => setIndex(index)}>{name}</button>
                    </Table.Cell>
                  <Table.Cell>{namePrev}</Table.Cell>
                  <Table.Cell>
                    <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
                    <Button icon='trash' size='tiny'
                      disabled={versionReferringFound}
                      onClick={() => removeVersion(index)}
                    />
                    <Button icon='list' size='tiny' onClick={() => publish(index)} />
                  </Table.Cell>
                </Table.Row>
              )
            })
          }
        </Table.Body>
      </Table>
      {
        version ? (
          <VersionComponent version={version} versionList={versionList}
            lineupList={lineupList} pkgList={pkgList} customerList={customerList}
            onChange={onChangeVersion}
          />
        ) : <></>
      }
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Release history</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <TextArea value={releaseHistory} rows={24} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button icon size='tiny'>
            <Icon name='clipboard' />
            Copy to clipboard
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
