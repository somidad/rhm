import React from "react";
import { useState } from "react";
import { Button, Form, Icon, Label, Table } from "semantic-ui-react";
import { Enum, Pkg, Release } from "../types";
import { findEmptyIndex } from "../utils";
import EnumSelector from "./EnumSelector";

type Props ={ 
  releaseList: Release[];
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
  onChange: (releaseList: Release[]) => void;
}

export default function ReleaseTable({
  releaseList, lineupList, pkgList, customerList,
  onChange,
}: Props) {
  const [pkgIndex, setPkgIndex] = useState(-1);
  const [customerIndexList, setCustomerIndexList] = useState<number[]>([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [pkgIndexNew, setPkgIndexNew] = useState(-1);
  const [customerIndexListNew, setCustomerIndexListNew] = useState<number[]>([]);

  function addRelease() {
    if (pkgIndex === -1) {
      return;
    }
    if (!customerIndexList.length) {
      return;
    }
    const releaseFound = releaseList.find((release) => release.pkgIndex === pkgIndex);
    if (releaseFound) {
      return;
    }
    const index = findEmptyIndex(releaseList.map((release) => release.index));
    const releaseListNew = [
      ...releaseList,
      { index, pkgIndex, customerIndexList },
    ];
    onChange(releaseListNew);
    setPkgIndex(-1);
    setCustomerIndexList([]);
  }

  function moveNewer(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    if (indexFound === releaseList.length - 1) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      releaseList[indexFound + 1],
      releaseList[indexFound],
      ...releaseList.slice(indexFound + 2),
    ];
    onChange(releaseListNew);
  }

  function moveOlder(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    if (indexFound === 0) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound - 1),
      releaseList[indexFound],
      releaseList[indexFound - 1],
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
  }

  function onClickEdit(index: number) {
    const releaseFound = releaseList.find((release) => release.index === index);
    if (!releaseFound) {
      return;
    }
    const { pkgIndex, customerIndexList } = releaseFound;
    const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex);
    if (!pkgFound) {
      return;
    }
    setPkgIndexNew(pkgIndex);
    setCustomerIndexListNew(customerIndexList);
    setEditIndex(index);
  }

  function onSubmitEditRelease() {
    if (!customerIndexListNew.length) {
      return;
    }
    const releaseFound = releaseList.find((release) => release.index !== editIndex && release.pkgIndex === pkgIndexNew);
    if (releaseFound) {
      return;
    }
    const indexFound = releaseList.findIndex((release) => release.index === editIndex);
    if (indexFound === -1) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      {
        index: editIndex,
        pkgIndex: pkgIndexNew,
        customerIndexList: customerIndexListNew,
      },
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
    setEditIndex(-1);
  }

  function removeRelease(index: number) {
    const indexFound = releaseList.findIndex((release) => release.index === index);
    if (indexFound === -1) {
      return;
    }
    const releaseListNew = [
      ...releaseList.slice(0, indexFound),
      ...releaseList.slice(indexFound + 1),
    ];
    onChange(releaseListNew);
  }

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>Customers</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row active>
          <Table.Cell>
            <Form>
              <Form.Field disabled={editIndex !== -1}>
                <select value={pkgIndex} onChange={(e) => setPkgIndex(+e.target.value)}>
                  <option value={-1}>Select a package</option>
                  {
                    pkgList.map((pkg) => {
                      const { index, name, lineupIndex } = pkg;
                      const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
                      const lineup = `- Lineup: ${lineupFound ? lineupFound.name : '(None)'}`;
                      return (
                        <option key={index} value={index}>{name} {lineup}</option>
                      )
                    })
                  }
                </select>
              </Form.Field>
            </Form>
          </Table.Cell>
          <Table.Cell rowSpan={2}>
            <Button icon='plus' size='tiny' onClick={addRelease} disabled={editIndex !== -1} />
          </Table.Cell>
        </Table.Row>
        <Table.Row active>
          <Table.Cell>
            <EnumSelector enumList={customerList} selectedIndexList={customerIndexList}
              onChange={setCustomerIndexList}
              disabled={editIndex !== -1}
            />
          </Table.Cell>
        </Table.Row>
        {
          releaseList.map((release) => {
            const { index, pkgIndex, customerIndexList }= release;
            const pkgFound = pkgList.find((pkg) => pkg.index === pkgIndex) as Pkg;
            const { name, lineupIndex } = pkgFound;
            const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
            const lineup = `- Lineup: ${lineupFound ? lineupFound.name : '(None)'}`;
            return index === editIndex ? (
              <React.Fragment key={index}>
                <Table.Row>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <select value={pkgIndexNew} onChange={(e) => setPkgIndexNew(+e.target.value)}>
                          {
                            pkgList.map((pkg) => {
                              const { index, name, lineupIndex } = pkg;
                              const lineupFound = lineupList.find((lineup) => lineup.index === lineupIndex);
                              const lineup = `- Lineup: ${lineupFound ? lineupFound.name : '(None)'}`;
                              return (
                                <option key={index} value={index}>{name} {lineup}</option>
                              )
                            })
                          }
                        </select>
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell rowSpan={2}>
                    <Button icon='check' size='tiny' onClick={onSubmitEditRelease} />
                    <Button icon='cancel' size='tiny' onClick={() => setEditIndex(-1)} />
                  </Table.Cell>
                </Table.Row>
                <Table.Row key={`${index}-lower`}>
                  <Table.Cell>
                    <EnumSelector enumList={customerList} selectedIndexList={customerIndexListNew}
                      onChange={setCustomerIndexListNew}
                    />
                  </Table.Cell>
                </Table.Row>
              </React.Fragment>
            ) : (
              <React.Fragment key={index}>
                <Table.Row>
                  <Table.Cell>
                    <Label ribbon>{name} {lineup}</Label>
                  </Table.Cell>
                  <Table.Cell rowSpan={2}>
                    <Button icon='edit' size='tiny' onClick={() => onClickEdit(index)} />
                    <Button icon='trash' size='tiny' onClick={() => removeRelease(index)} />
                    <Button icon size='tiny' onClick={() => moveOlder(index)} disabled={editIndex !== -1}>
                      <Icon name='angle up' />
                      Older
                    </Button>
                    <Button icon size='tiny' onClick={() => moveNewer(index)} disabled={editIndex !== -1}>
                      <Icon name='angle down' />
                      Newer
                    </Button>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    {
                      customerList
                        .filter((customer) => customerIndexList.find((customerIndex) => customer.index === customerIndex) !== undefined)
                        .map((customer) => customer.name)
                        .join(', ')
                    }
                  </Table.Cell>
                </Table.Row>
              </React.Fragment>
            )
          })
        }
      </Table.Body>
    </Table>
  )
}
