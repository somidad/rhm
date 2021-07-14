import { Input, Menu } from 'antd';
import { createRef, useState } from 'react';
import { ChangeV2, Enum, Pkg, ReleaseV2, VersionV2 } from '../types';
import { load } from '../utils';

type Props = {
  changeList: ChangeV2[];
  customerList: Enum[];
  lineupList: Enum[];
  pkgList: Pkg[];
  releaseList: ReleaseV2[];
  versionList: VersionV2[];
  onChangeChangeList: (changeList: ChangeV2[]) => void;
  onChangeCustomerList: (customerList: Enum[]) => void;
  onChangeLineupList: (lineupList: Enum[]) => void;
  onChangePkgList: (pkgList: Pkg[]) => void;
  onChangeReleaseList: (releaseList: ReleaseV2[]) => void;
  onChangeVersionList: (versionList: VersionV2[]) => void;
};

const UNTITLED = 'Untitled';

export default function AppMenu({
  changeList,
  customerList,
  lineupList,
  pkgList,
  releaseList,
  versionList,
  onChangeChangeList,
  onChangeCustomerList,
  onChangeLineupList,
  onChangePkgList,
  onChangeReleaseList,
  onChangeVersionList,
}: Props) {
  const refLoad = createRef<HTMLInputElement>();
  let file: File | undefined;
  const refSave = createRef<HTMLAnchorElement>();

  const [featureName, setFeatureName] = useState(UNTITLED);

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (!files) {
      return;
    }
    file = files[0];
    if (!file) {
      return;
    }
    reader.readAsText(file);
  }

  function onClickNew() {
    setFeatureName(UNTITLED);
    onChangeReleaseList([]);
    onChangeVersionList([]);
    onChangeLineupList([{ index: 0, name: "(None)" }]);
    onChangePkgList([]);
    onChangeChangeList([]);
    onChangeCustomerList([]);
  }

  function onClickSave() {
    if (refSave.current === null) {
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ versionList, lineupList, pkgList, releaseList, changeList, customerList })],
      { type: "application/json" }
    );
    refSave.current.download = `${featureName}.json`;
    refSave.current.href = window.URL.createObjectURL(blob);
    refSave.current.click();
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (!file) {
      return;
    }
    if (!e.target) {
      return;
    }
    const { result } = e.target;
    if (result === null || result instanceof ArrayBuffer) {
      return;
    }
    const { name } = file;
    const indexLast = name.lastIndexOf(".");
    const featureName = name.substring(0, indexLast);
    const { changeList, versionList, lineupList, pkgList, releaseList, customerList } = load(result);
    setFeatureName(featureName);
    onChangeChangeList(changeList);
    onChangeCustomerList(customerList);
    onChangeLineupList(lineupList);
    onChangeChangeList(changeList);
    onChangePkgList(pkgList);
    onChangeVersionList(versionList);
    onChangeReleaseList(releaseList);
  };

  return (
    <>
      <Menu mode="horizontal" selectable={false}>
        <Menu.Item key="new" onClick={onClickNew}>
          New
        </Menu.Item>
        <Menu.Item key="load" onClick={() => refLoad.current?.click()}>
          Load
        </Menu.Item>
        <Menu.Item key="featureName" disabled>
          <Input
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
          />
        </Menu.Item>
        <Menu.Item key="save" onClick={() => onClickSave()}>
          Save
        </Menu.Item>
      </Menu>
      <input
        type="file"
        accept=".json"
        hidden
        ref={refLoad}
        onChange={onChangeFile}
      />
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
      <a href="#" ref={refSave} hidden />
    </>
  );
}