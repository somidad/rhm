import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { Enum } from "../types";

type Props = {
  title: string;
  enumList: Enum[];
  onChange: (enumList: Enum[]) => void;
};

export default function EnumTable({ title, enumList, onChange }: Props) {
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
    const index = enumList.reduce((indexPrev, enumItem) => {
      if (enumItem.index === indexPrev) {
        return indexPrev + 1;
      }
      return indexPrev;
    }, 0);
    const enumListNew = [
      ...enumList,
      { index, name },
    ].sort((a, b) => a.index - b.index);
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

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{title}</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form onSubmit={addEnumItem}>
              <Form.Field disabled={editIndex !== -1}>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Button
              icon='plus' size='tiny'
              onClick={addEnumItem}
              disabled={editIndex !== -1}
            />
          </Table.Cell>
        </Table.Row>
        {
          enumList.map((enumItem) => {
            const { index, name } = enumItem;
            return index === editIndex ? (
              <Table.Row key={index}>
                <Table.Cell>
                  <Form onSubmit={() => onSubmitRename(index)}>
                    <Form.Field>
                      <input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                    </Form.Field>
                  </Form>
                </Table.Cell>
                <Table.Cell>
                  <Button icon='check' size='tiny' onClick={() => onSubmitRename(index)} />
                  <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row key={index}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>
                  <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
                  <Button icon='trash' size='tiny' />
                </Table.Cell>
              </Table.Row>
            )
          })
        }
      </Table.Body>
    </Table>
  );
}
