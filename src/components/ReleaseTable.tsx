import { useState } from "react";
import { Button, Form, Icon, Item, Label } from "semantic-ui-react";
import { Enum, Pkg, Release } from "../types";

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
    <Item.Group divided>
      <Item>
        <Item.Content>
          <Form>
            <Form.Group>
              <Form.Field inline>
                <label>Package</label>
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
              <Form.Field inline>
                <label>Lineup</label>
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
            </Form.Group>
            <Form.Field>
              <label>Customers</label>
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
            </Form.Field>
          </Form>
          <Item.Extra>
            <Button icon='plus' size='tiny' floated='right' />
          </Item.Extra>
        </Item.Content>
      </Item>
    </Item.Group>
  )
}
