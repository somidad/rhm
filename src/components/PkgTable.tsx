import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { Enum, Pkg } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  pkgList: Pkg[];
  lineupList: Enum[];
  onChange: (pkgList: Pkg[]) => void;
};

export default function PkgTable({ pkgList, lineupList, onChange }: Props) {
  const [editIndex, setEditIndex] = useState(-1);
  const [name, setName] = useState('');
  const [lineupIndex, setLineupIndex] = useState(0);
  const [nameNew, setNameNew] = useState('');
  const [lineupIndexNew, setLineupIndexNew] = useState(0);

  function addPkg() {
    if (!name) {
      return;
    }
    const pkgFound = pkgList.find((pkg) => pkg.name === name);
    if (pkgFound) {
      return;
    }
    const index = findEmptyIndex(pkgList.map((pkg) => pkg.index));
    const pkgListNew = [
      ...pkgList,
      { index, name, lineupIndex },
    ].sort((a, b) => a.name.localeCompare(b.name));
    onChange(pkgListNew);
    setName('');
  }

  function onClickEdit(index: number) {
    const pkgFound = pkgList.find((pkg) => pkg.index === index);
    if (!pkgFound) {
      return;
    }
    setNameNew(pkgFound.name);
    setLineupIndexNew(pkgFound.lineupIndex);
    setEditIndex(index);
  }

  function onSubmitEditPkg(index: number) {
    if (!nameNew) {
      return;
    }
    const pkgFound = pkgList.find((pkg) => pkg.index !== index && pkg.name === nameNew);
    if (pkgFound) {
      return;
    }
    const indexFound = pkgList.findIndex((pkg) => pkg.index === index);
    if (indexFound === -1) {
      return;
    }
    const pkgListNew = [
      ...pkgList.slice(0, indexFound),
      { index, name: nameNew, lineupIndex: lineupIndexNew },
      ...pkgList.slice(indexFound + 1),
    ];
    onChange(pkgListNew);
    setEditIndex(-1);
  }

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
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
                <select value={lineupIndex} onChange={(e) => setLineupIndex(+e.target.value)}>
                  {
                    lineupList.map((lineup) => {
                      const { index, name} = lineup;
                      return (
                        <option key={index} value={index}>{name}</option>
                      );
                    })
                  }
                </select>
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell>
            <Button
              icon='plus' size='tiny'
              onClick={addPkg}
              disabled={editIndex !== -1}
            />
          </Table.Cell>
        </Table.Row>
        {
          pkgList.map((pkg) => {
            const { index, name, lineupIndex } = pkg;
            const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
            const lineupName = lineupFound ? lineupFound.name : 'Lineup not found';
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
                  <Form>
                    <Form.Field>
                      <select value={lineupIndexNew} onChange={(e) => setLineupIndexNew(+e.target.value)}>
                        {
                          lineupList.map((lineup) => {
                            const { index, name } = lineup;
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
                  <Button icon='check' size='tiny' onClick={() => onSubmitEditPkg(index)} />
                  <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row key={index}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{lineupName}</Table.Cell>
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
