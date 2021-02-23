import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { TypeLineup } from "../types";

type Props = {
  lineupList: TypeLineup[];
  onChange: (lineupList: TypeLineup[]) => void;
};

export default function Lineup({ lineupList, onChange }: Props) {
  const [editIndex, setEditIndex] = useState(-1);
  const [name, setName] = useState('');
  const [nameNew, setNameNew] = useState('');

  function addLineup() {
    if (!name) {
      return;
    }
    const lineupFound = lineupList.find((lineup) => lineup.name === name);
    if (lineupFound) {
      return;
    }
    const index = lineupList.reduce((indexPrev, lineup) => {
      if (lineup.index === indexPrev) {
        return indexPrev + 1;
      }
      return indexPrev;
    }, 0);
    const lineupListNew = [
      ...lineupList,
      { index, name },
    ].sort((a, b) => a.index - b.index);
    onChange(lineupListNew);
    setName('');
  }

  function onClickEdit(index: number) {
    const lineup = lineupList.find((lineup) => lineup.index === index);
    if (!lineup) {
      return;
    }
    setNameNew(lineup.name);
    setEditIndex(index);
  }

  function onClickRename(index: number) {
    const indexFound = lineupList.findIndex((lineup) => lineup.index === index);
    if (indexFound === -1) {
      return;
    }
    const lineupListNew = [
      ...lineupList.slice(0, indexFound),
      { index, name: nameNew },
      ...lineupList.slice(indexFound + 1),
    ];
    onChange(lineupListNew);
    setEditIndex(-1);
  }

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form onSubmit={addLineup}>
              <Form.Field disabled={editIndex !== -1}>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Button
              icon='plus' size='tiny'
              onClick={addLineup}
              disabled={editIndex !== -1}
            />
          </Table.Cell>
        </Table.Row>
        {
          lineupList.map((lineup) => {
            const { index, name } = lineup;
            return index === editIndex ? (
              <Table.Row key={index}>
                <Table.Cell>
                  <Form>
                    <Form.Field>
                      <input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                    </Form.Field>
                  </Form>
                </Table.Cell>
                <Table.Cell>
                  <Button icon='check' size='tiny' onClick={() => onClickRename(index)} />
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
