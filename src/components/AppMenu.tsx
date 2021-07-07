import { Input, Menu } from 'antd';
import { createRef, useState } from 'react';
import { Enum, Pkg, Version } from '../types';
import { load } from '../utils';

type Props = {
  customerList: Enum[];
  lineupList: Enum[];
  pkgList: Pkg[];
  versionList: Version[];
  onChangeCustomerList: (customerList: Enum[]) => void;
  onChangeLineupList: (lineupList: Enum[]) => void;
  onChangePkgList: (pkgList: Pkg[]) => void;
  onChangeVersionList: (versionList: Version[]) => void;
};

const UNTITLED = 'Untitled';

export default function AppMenu({
  customerList,
  lineupList,
  pkgList,
  versionList,
  onChangeCustomerList,
  onChangeLineupList,
  onChangePkgList,
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
    onChangeVersionList([]);
    onChangeLineupList([{ index: 0, name: "(None)" }]);
    onChangePkgList([]);
    onChangeCustomerList([]);
  }

  function onClickSave() {
    if (refSave.current === null) {
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ versionList, lineupList, pkgList, customerList })],
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
    const { versionList, lineupList, pkgList, customerList } = load(result);
    setFeatureName(featureName);
    onChangeCustomerList(customerList);
    onChangeLineupList(lineupList);
    onChangePkgList(pkgList);
    onChangeVersionList(versionList);
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