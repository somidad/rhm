import { useState } from "react";
import { Button, Form, Icon, Label, Popup, Segment, Table } from "semantic-ui-react";
import { Enum, Pkg, Release } from "../types";

type Props ={ 
  releaseList: Release[];
  lineupList: Enum[];
  pkgList: Pkg[];
  customerList: Enum[];
}

export default function ReleaseTable({ releaseList, lineupList, pkgList, customerList }: Props) {
  const [openCustomer, setOpenCustomer] = useState(false);
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

  function onCloseCustomer() {
    setOpenCustomer(false);
  }

  function onOpenCustomer() {
    setOpenCustomer(true);
  }

  return (
    <Table celled selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Package</Table.HeaderCell>
          <Table.HeaderCell>Lineup</Table.HeaderCell>
          <Table.HeaderCell colSpan={2}>Customer</Table.HeaderCell>
          <Table.HeaderCell collapsing>Actions</Table.HeaderCell>
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
          <Table.Cell>
            {
              customerList
                .filter((customer) => {
                  return selectedCustomerIndexList.includes(customer.index)
                })
                .map((customer) => customer.name)
                .join(', ')
            }
            </Table.Cell>
            <Table.Cell collapsing>
            <Popup
              wide
              position='top center'
              trigger={<Button icon='edit' size='tiny' />}
              open={openCustomer}
              onClose={onCloseCustomer}
              onOpen={onOpenCustomer}
              content={
                <>
                  {
                    customerList.map((customer) => {
                      const { index, name } = customer;
                      const selected = selectedCustomerIndexList.find((selectedCUstomerIndex) => selectedCUstomerIndex === index) !== undefined;
                      const color = selected ? 'blue' : undefined;
                      const icon = selected ? 'check' : 'minus';
                      return (
                        <Label key={index} as='a' className='customer-label' color={color}
                          onClick={() => onClickCustomer(index)}
                        >
                          <Icon name={icon} />
                          {name}
                        </Label>
                      )
                    })
                  }
                  {/* <Segment basic textAlign='right'>
                    <Button icon='check' size='tiny' />
                    <Button icon='cancel' size='tiny' onClick={onCloseCustomer} />
                  </Segment> */}
                </>
              }
              on='click'
            />
          </Table.Cell>
          <Table.Cell>
            <Button icon='plus' size='tiny' />
          </Table.Cell>
        </Table.Row>
        {
          releaseList.map((release) => <></>)
        }
      </Table.Body>
    </Table>
  )
}
