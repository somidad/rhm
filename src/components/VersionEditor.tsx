import { Button, Col, Form, Row, Select, Typography } from "antd";
import { Gutter } from "antd/lib/grid/row";
import Title from "antd/lib/typography/Title";
import { useState } from "react";
import { Modal, TextArea } from "semantic-ui-react";
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

const SPAN_ACTIONS = 4;

const SPAN_VERSION_IN_RELEASES = 4;
const SPAN_PKG = 12;
const SPAN_CUSTOMERS = 4;

const SPAN_VERSION_IN_CHANGES = 4;
const SPAN_DESCRIPTION = 4;
const SPAN_BEFORE = 4;
const SPAN_AFTER = 4;
const SPAN_CUSTOMERS_IN_CHANGES = 4;

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
      {/* <Row gutter={GUTTER}>
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
          <Form name='add' onFinish={addVersion}>
            <Input
              value={name} onChange={(e) => setName(e.target.value)}
              disabled={editIndex !== -1}
            />
          </Form>
        </Col>
        <Col span={SPAN_PREVIOUS}>
          <Select
            value={indexPrev} onChange={(value) => setIndexPrev(value)}
            disabled={editIndex !== -1}
          >
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
      {
        versionList.map((version) => {
          const { index, name, indexPrev } = version;
          if (index === editIndex) {
            return (
              <Row key={index} gutter={GUTTER}>
                <Col span={SPAN_VERSION}>
                  <Form name='edit' onFinish={onSubmitEditVersion}>
                    <Input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                  </Form>
                </Col>
                <Col span={SPAN_PREVIOUS}>
                  <Select value={indexPrevNew} onChange={(value) => setIndexPrevNew(value)}>
                    <Option value={-1}>(None)</Option>
                    {
                      versionList.map((version) => {
                        const { index, name } = version;
                        return (
                          <Option key={index} value={index} disabled={index === editIndex}>{name}</Option>
                        )
                      })
                    }
                  </Select>
                </Col>
                <Col span={SPAN_ACTIONS}>
                  <Button onClick={onSubmitEditVersion}>Ok</Button>
                  <Button onClick={() => setEditIndex(-1)}>Cancel</Button>
                </Col>
              </Row>
            )
          }
          const versionPrevFound = versionList.find((version) => version.index === indexPrev);
          const namePrev = versionPrevFound ? versionPrevFound.name : '(None)';
          const versionReferringFound = !!versionList.find((version) => version.indexPrev === index);
          return (
            <Row key={index} gutter={GUTTER}>
              <Col span={SPAN_VERSION}>
                {name}
              </Col>
              <Col span={SPAN_PREVIOUS}>{namePrev}</Col>
              <Col span={SPAN_ACTIONS}>
                <Button onClick={() => onClickEdit(index)}>Edit</Button>
                <Button
                  disabled={versionReferringFound}
                  onClick={() => removeVersion(index)}
                >
                  Remove
                </Button>
                <Button onClick={() => onClickPublish(index)} />
              </Col>
            </Row>
          )
        })
      } */}
      <Title level={3}>
        Releases
      </Title>
      <Row gutter={GUTTER}>
        <Col span={SPAN_VERSION_IN_RELEASES}>
          <Typography.Text strong>Version</Typography.Text>
        </Col>
        <Col span={SPAN_PKG}>
          <Typography.Text strong>Package</Typography.Text>
        </Col>
        <Col span={SPAN_CUSTOMERS}>
          <Typography.Text strong>Customers</Typography.Text>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Typography.Text strong>Actions</Typography.Text>
        </Col>
      </Row>
      <Title level={3}>
        Changes
      </Title>
      <Row gutter={GUTTER}>
        <Col span={SPAN_VERSION_IN_CHANGES}>
          <Typography.Text strong>Version</Typography.Text>
        </Col>
        <Col span={SPAN_DESCRIPTION}>
          <Typography.Text strong>Description</Typography.Text>
        </Col>
        <Col span={SPAN_BEFORE}>
          <Typography.Text strong>Before change</Typography.Text>
        </Col>
        <Col span={SPAN_AFTER}>
          <Typography.Text strong>After change</Typography.Text>
        </Col>
        <Col span={SPAN_CUSTOMERS_IN_CHANGES}>
          <Typography.Text strong>Customers</Typography.Text>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Typography.Text strong>Actions</Typography.Text>
        </Col>
      </Row>
      {/* {
        version ? (
          <VersionComponent version={version} versionList={versionList}
            lineupList={lineupList} pkgList={pkgList} customerList={customerList}
            onChange={onChangeVersion}
          />
        ) : <></>
      } */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Release history</Modal.Header>
        <Modal.Content>
          <Form>
              <TextArea value={releaseHistory} rows={24} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => navigator.clipboard.writeText(releaseHistory)}>
            Copy to clipboard
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
