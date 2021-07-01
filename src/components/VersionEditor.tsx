import { Button, Col, Input, Row, Select, Typography } from "antd";
import { Gutter } from "antd/lib/grid/row";
import { useState } from "react";
import { Form, Icon, Modal, Table, TextArea } from "semantic-ui-react";
import { Enum, Pkg, Version } from "../types";
import { findEmptyIndex, publish } from "../utils";
import VersionComponent from "./VersionComponent";

const { Option } = Select;

type Props = {
  versionList: Version[];
  onChange: (versionList: Version[]) => void;
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
};

const SPAN_VERSION = 12;
const SPAN_PREVIOUS = 4;
const SPAN_ACTIONS = 4;

const GUTTER: [Gutter, Gutter] = [16, 24];

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

  function onClickPublish(index: number) {
    const releaseHistory = publish(versionList, index, lineupList, pkgList, customerList);
    if (!releaseHistory) {
      return;
    }
    setReleaseHistory(releaseHistory);
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
      <Row gutter={GUTTER}>
        <Col span={SPAN_VERSION}>
          <Typography.Text strong>Version</Typography.Text>
        </Col>
        <Col span={SPAN_PREVIOUS}>
          <Typography.Text strong>Previous version</Typography.Text>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Typography.Text strong>Actions</Typography.Text>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col span={SPAN_VERSION}>
          <Input
            value={name} onChange={(e) => setName(e.target.value)}
            disabled={editIndex !== -1}
          />
        </Col>
        <Col span={SPAN_PREVIOUS}>
          <Select value={indexPrev} onChange={(value) => setIndexPrev(value)}>
            <Option value={-1}>(None)</Option>
            {
              versionList.map((version) => {
                const { index, name } = version;
                return (
                  <Option key={index} value={index}>{name}</Option>
                )
              })
            }
          </Select>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Button onClick={addVersion} disabled={editIndex !== -1}>
            Add
          </Button>
        </Col>
      </Row>
      <Table celled compact selectable>
        <Table.Body>
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
                                  <option key={index} value={index} disabled={index === editIndex}>{name}</option>
                                )
                              })
                            }
                          </select>
                        </Form.Field>
                      </Form>
                    </Table.Cell>
                    <Table.Cell singleLine>
                      <Button onClick={onSubmitEditVersion}>Ok</Button>
                      <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
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
                  <Table.Cell singleLine>
                    <Button onClick={() => onClickEdit(index)}>Edit</Button>
                    <Button
                      disabled={versionReferringFound}
                      onClick={() => removeVersion(index)}
                    >
                      Remove
                    </Button>
                    <Button onClick={() => onClickPublish(index)} />
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
          <Button onClick={() => navigator.clipboard.writeText(releaseHistory)}>
            <Icon name='clipboard' />
            Copy to clipboard
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
