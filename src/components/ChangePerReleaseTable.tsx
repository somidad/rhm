import { Table } from "antd";
import { keyActions, keyCustomers, keyDescription, keyLineup, keyVersion, titleActions, titleCustomers, titleDescription, titleLineup, titleVersion } from "../constants";
import { ChangeV2, Enum, Pkg, ReleaseV2, VersionV2 } from "../types";

type ChangePerReleaseTableProps = {
  changeList: ChangeV2[];
  customerList: Enum[];
  lineupList: Enum[];
  pkgList: Pkg[];
  releaseList: ReleaseV2[];
  versionIndex: number;
  versionList: VersionV2[];
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
  ];

  return <Table columns={columns} />;
}