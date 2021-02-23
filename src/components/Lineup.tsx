import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { TypeLineup } from "../types";

type Props = {
  lineupList: TypeLineup[];
  onChange: (lineupList: TypeLineup[]) => void;
};

export default function Lineup({ lineupList, onChange }: Props) {
  const [name, setName] = useState('');

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
              <Form.Field>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Button
              icon='plus' size='tiny'
              onClick={addLineup}
            />
          </Table.Cell>
        </Table.Row>
        {
          lineupList.map((lineup) => {
            const { index, name } = lineup;
            return (
              <Table.Row key={index}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>
                  <Button icon='edit' size='tiny' />
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
