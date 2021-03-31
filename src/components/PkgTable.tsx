import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { Enum, Pkg } from "../types";
import { findEmptyIndex } from "../utils";

type Props = {
  pkgList: Pkg[];
  lineupList: Enum[];
  onChange: (pkgList: Pkg[]) => void;
  usedPkgIndexList?: number[];
};

export default function PkgTable({ pkgList, lineupList, onChange, usedPkgIndexList }: Props) {
  const [editIndex, setEditIndex] = useState(-1);
  const [name, setName] = useState('');
  const [lineupIndex, setLineupIndex] = useState(-1);
  const [nameNew, setNameNew] = useState('');
  const [lineupIndexNew, setLineupIndexNew] = useState(-1);

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

  function removePkg(index: number) {
    if (usedPkgIndexList && usedPkgIndexList.includes(index)) {
      return;
    }
    const indexFound = pkgList.findIndex((pkg) => pkg.index === index);
    if (indexFound === -1) {
      return;
    }
    const enumListNew = [
      ...pkgList.slice(0, indexFound),
      ...pkgList.slice(indexFound + 1),
    ];
    onChange(enumListNew);
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
                  <option value={-1}>(None)</option>
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
            const lineup = lineupFound ? lineupFound.name : '(None)';
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
                        <option value={-1}>(None)</option>
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
                <Table.Cell singleLine>
                  <Button icon='check' size='tiny' onClick={() => onSubmitEditPkg(index)} />
                  <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row key={index}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{lineup}</Table.Cell>
                <Table.Cell singleLine>
                  <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
                  <Button icon='trash' size='tiny' onClick={() => removePkg(index)}
                    disabled={usedPkgIndexList && usedPkgIndexList.includes(index)}
                  />
                </Table.Cell>
              </Table.Row>
            )
          })
        }
      </Table.Body>
    </Table>
  );
}
