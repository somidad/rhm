import { Button, Popover, Table, Typography } from "antd";
import { keyActions, keyCustomers, keyDescription, keyLineup, keyVersion, parenError, parenNone, titleActions, titleCustomers, titleDescription, titleLineup, titleVersion } from "../constants";
import { ChangeV2, Enum, Pkg, ReleaseV2, VersionV2 } from "../types";
const { Text } = Typography;

type ChangePerReleaseTableProps = {
  changeList: ChangeV2[];
  customerList: Enum[];
  lineupList: Enum[];
  pkgList: Pkg[];
  releaseList: ReleaseV2[];
  versionIndex: number;
  versionList: VersionV2[];
};

type EditableCellProps = {
  record: {
    key: number;
    description: string;
    beforeChange: string;
    afterChange: string;
    lineupIndex: number;
    version: number;
  };
  dataIndex: string;
  children: any;
};

type PopoverContentProps = {
  beforeChange: string;
  afterChange: string;
};

export default function ChangePerReleaseTable({
  changeList,
  customerList,
  lineupList,
  pkgList,
  releaseList,
  versionIndex,
  versionList,
}: ChangePerReleaseTableProps) {
  const columns: any[] = [
    { key: keyVersion, dataIndex: keyVersion, title: titleVersion },
    { key: keyDescription, dataIndex: keyDescription, title: titleDescription },
    { key: keyLineup, dataIndex: keyLineup, title: titleLineup },
    { key: keyCustomers, dataIndex: keyCustomers, title: titleCustomers },
    { key: keyActions, dataIndex: keyActions, title: titleActions },
  ].map((column) => {
    const { dataIndex } = column;
    return {
      ...column,
      onCell: (record: any) => ({
        record,
        dataIndex,
      }),
    };
  });

  const dataSource = [
    ...changeList.map((change) => {
      const { description, beforeChange, afterChange, lineupIndex, versionIndex } = change;
      return {
        description, beforeChange, afterChange, lineupIndex, version: versionIndex,
      };
    }),
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      pagination={false}
    />
  );

  function EditableCell({ record, dataIndex, children, ...restProps }: EditableCellProps) {
    const { key, beforeChange, afterChange, lineupIndex, version: versionIndex } = record;
    const versionFound = versionList.find((version) => version.index === versionIndex);
    return (
      <td {...restProps}>
        {
          dataIndex === keyVersion ? (
            versionFound?.name ?? parenError
          ) : dataIndex === keyDescription ? (
            <Popover content={() => <PopoverContent beforeChange={beforeChange} afterChange={afterChange} />}>
              {children}
            </Popover>
          ) : dataIndex === keyLineup ? (
            lineupIndex === -1 ? parenNone : lineupList.find((lineup) => lineup.index === lineupIndex)?.name ?? parenError
          ) : dataIndex === keyActions ? (
            <Button>Edit</Button>
          ) : (
            children
          )
        }
      </td>
    )
  }

  function PopoverContent({ beforeChange, afterChange }: PopoverContentProps) {
    return (
      <>
        <Text strong>Before change</Text>
        <br />
        {beforeChange}
        <br />
        <Text strong>After change</Text>
        <br />
        {afterChange}
      </>
    )
  }
}