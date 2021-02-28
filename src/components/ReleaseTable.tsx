import { useState } from "react";
import { Button, Form, Icon, Table } from "semantic-ui-react";
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

  function addRelease() {
    if (pkgIndex === -1) {
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
        <Table.Row>
          <Table.Cell>
            <Form>
              <Form.Field>
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
            <Button icon='plus' size='tiny' onClick={addRelease} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <EnumSelector enumList={customerList} selectedIndexList={customerIndexList}
              onChange={setCustomerIndexList}
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
            return (
              <>
                <Table.Row key={`${index}-upper`}>
                  <Table.Cell>
                    {name} {lineup}
                  </Table.Cell>
                  <Table.Cell rowSpan={2}>
                    <Button icon='edit' size='tiny' />
                    <Button icon='trash' size='tiny' />
                    <Button icon size='tiny'>
                      <Icon name='angle up' />
                      Older
                    </Button>
                    <Button icon size='tiny'>
                      <Icon name='angle down' />
                      Newer
                    </Button>
                  </Table.Cell>
                </Table.Row>
                <Table.Row key={`${index}-lower`}>
                  <Table.Cell>
                    {
                      customerList
                        .filter((customer) => customerIndexList.find((customerIndex) => customer.index === customerIndex) !== undefined)
                        .map((customer) => customer.name)
                        .join(', ')
                    }
                  </Table.Cell>
                </Table.Row>
              </>
            )
          })
        }
      </Table.Body>
    </Table>
  )
}
