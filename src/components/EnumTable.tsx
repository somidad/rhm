import { Button, Col, Form, Input, Row, Typography } from "antd";
import { Gutter } from "antd/lib/grid/row";
import { useState } from "react";
import { Enum } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  title: string;
  enumList: Enum[];
  onChange: (enumList: Enum[]) => void;
  usedIndexList?: number[];
};

const SPAN_ENUM = 16;
const SPAN_ACTIONS = 8;
const GUTTER: [Gutter, Gutter] = [16, 24];

export default function EnumTable({ title, enumList, onChange, usedIndexList }: Props) {
  const [editIndex, setEditIndex] = useState(-1);
  const [name, setName] = useState('');
  const [nameNew, setNameNew] = useState('');

  function addEnumItem() {
    if (!name) {
      return;
    }
    const enumItemFound = enumList.find((enumItem) => enumItem.name === name);
    if (enumItemFound) {
      return;
    }
    const index = findEmptyIndex(enumList.map((enumItem) => enumItem.index));
    const enumListNew = [
      ...enumList,
      { index, name },
    ].sort((a, b) => a.name.localeCompare(b.name));
    onChange(enumListNew);
    setName('');
  }

  function onClickEdit(index: number) {
    const enumItem = enumList.find((enumItem) => enumItem.index === index);
    if (!enumItem) {
      return;
    }
    setNameNew(enumItem.name);
    setEditIndex(index);
  }

  function onSubmitRename(index: number) {
    if (!nameNew) {
      return;
    }
    const enumItemFound = enumList.find((enumItem) => enumItem.index !== index && enumItem.name === nameNew);
    if (enumItemFound) {
      return;
    }
    const indexFound = enumList.findIndex((enumItem) => enumItem.index === index);
    if (indexFound === -1) {
      return;
    }
    const enumListNew = [
      ...enumList.slice(0, indexFound),
      { index, name: nameNew },
      ...enumList.slice(indexFound + 1),
    ];
    onChange(enumListNew);
    setEditIndex(-1);
  }

  function removeEnumItem(index: number) {
    if (usedIndexList && usedIndexList.includes(index)) {
      return;
    }
    const indexFound = enumList.findIndex((enumItem) => enumItem.index === index);
    if (indexFound === -1) {
      return;
    }
    const enumListNew = [
      ...enumList.slice(0, indexFound),
      ...enumList.slice(indexFound + 1),
    ];
    onChange(enumListNew);
  }

  return (
    <>
      <Row gutter={GUTTER}>
        <Col span={SPAN_ENUM}>
          <Typography.Text strong>{title}</Typography.Text>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Typography.Text strong>Actions</Typography.Text>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col span={SPAN_ENUM}>
          <Form name='add' onFinish={addEnumItem}>
            <Input
              value={name} onChange={(e) => setName(e.target.value)}
              disabled={editIndex !== -1}
            />
          </Form>
        </Col>
        <Col span={SPAN_ACTIONS}>
          <Form name='add'>
            <Button
              onClick={addEnumItem}
              disabled={editIndex !== -1}
            >
              Add
            </Button>
          </Form>
        </Col>
      </Row>
      {
        enumList.map((enumItem) => {
          const { index, name } = enumItem;
          return index === editIndex ? (
            <Row key={index} gutter={GUTTER}>
              <Col span={SPAN_ENUM}>
                <Form name='edit' onFinish={() => onSubmitRename(index)}>
                  <Input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                </Form>
              </Col>
              <Col span={SPAN_ACTIONS}>
                <Form name='edit'>
                  <Button htmlType='submit' onClick={() => onSubmitRename(index)}>Ok</Button>
                  <Button htmlType='button' onClick={() => setEditIndex(-1)}>Cancel</Button>
                </Form>
              </Col>
            </Row>
          ) : (
            <Row key={index} gutter={GUTTER}>
              <Col span={SPAN_ENUM}>{name}</Col>
              <Col span={SPAN_ACTIONS}>
                <Button onClick={() => onClickEdit(index)}>Edit</Button>
                <Button onClick={() => removeEnumItem(index)}
                  disabled={usedIndexList && usedIndexList.includes(index)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          )
        })
      }
    </>
  );
}
