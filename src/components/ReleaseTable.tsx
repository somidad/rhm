import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { Enum, Pkg, Release } from "../types";
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
  const [selectedCustomerIndexList, setSelectedCustomerIndexList] = useState<number[]>([]);

  function onClickCustomer(index: number) {
    const indexFound = selectedCustomerIndexList.findIndex((selectedCustomerIndex) => selectedCustomerIndex === index);
    if (indexFound === -1) {
      setSelectedCustomerIndexList([
        ...selectedCustomerIndexList,
        index,
      ]);
    } else {
      setSelectedCustomerIndexList([
        ...selectedCustomerIndexList.slice(0, indexFound),
        ...selectedCustomerIndexList.slice(indexFound + 1),
      ]);
    }
  }

  return (
    <Table celled compact selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>Customers</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Form>
              <Form.Field>
                <select>
                  <option value={-1}>Select a package</option>
                  {
                    pkgList.map((pkg) => {
                      const { index, name } = pkg;
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
            <Form>
              <Form.Field>
                <select>
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
          <Table.Cell rowSpan={2}>
            <Button icon='plus' size='tiny' />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={2}>
            <EnumSelector enumList={customerList} selectedIndexList={selectedCustomerIndexList}
              onChange={setSelectedCustomerIndexList}
            />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}
