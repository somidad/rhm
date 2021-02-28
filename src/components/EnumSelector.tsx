import { Icon, Label } from "semantic-ui-react";
import { Enum } from "../types";

type Props = {
  enumList: Enum[];
  selectedIndexList: number[];
  onChange: (selectedIndexList: number[]) => void;
  disabled?: boolean;
};

export default function EnumSelector({ enumList, selectedIndexList, onChange, disabled }: Props) {
  function toggle(index: number) {
    if (disabled) {
      return;
    }
    const indexFound = selectedIndexList.findIndex((selectedIndex) => selectedIndex === index);
    const selectedIndexListNew = indexFound === -1 ? [
      ...selectedIndexList,
      index,
    ] : [
      ...selectedIndexList.slice(0, indexFound),
      ...selectedIndexList.slice(indexFound + 1),
    ];
    onChange(selectedIndexListNew);
  }

  return (
    <>
      {
        enumList.map((enumItem) => {
          const { index, name } = enumItem;
          const selected = selectedIndexList.find((selectedIndex) => selectedIndex=== index) !== undefined;
          const color = selected ? 'blue' : undefined;
          const icon = selected ? 'plus' : 'minus';
          return (
            <Label key={index} as='a' color={color} onClick={() => toggle(index)}>
              <Icon name={icon} />
              {name}
            </Label>
          )
        })
      }
    </>
  );
}
