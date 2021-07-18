import { FileOutlined, FolderOpenOutlined, SaveOutlined } from "@ant-design/icons";
import { Input, Menu } from "antd";
import { createRef, useState } from "react";
import { Enum, Pkg, VersionV2 } from "../types";
import { load } from "../utils";

type Props = {
  customerList: Enum[];
  lineupList: Enum[];
  pkgList: Pkg[];
  versionList: VersionV2[];
  onNew: () => void;
  onLoad: (content: {
    customerList: Enum[];
    lineupList: Enum[];
    pkgList: Pkg[];
    versionList: VersionV2[];
  }) => void;
};

const UNTITLED = "Untitled";

export default function AppMenu({
  customerList,
  lineupList,
  pkgList,
  versionList,
  onNew,
  onLoad,
}: Props) {
  const refLoad = createRef<HTMLInputElement>();
  let file: File | undefined;
  const refSave = createRef<HTMLAnchorElement>();

  const [featureName, setFeatureName] = useState(UNTITLED);

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    file = e.target.files?.[0];
    if (!file) {
      return;
    }
    reader.readAsText(file);
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
    const result = e.target?.result;
    if (typeof result !== "string") {
      return;
    }
    const { name } = file;
    const indexLast = name.lastIndexOf(".");
    const featureName = name.substring(0, indexLast);
    const { versionList, lineupList, pkgList, customerList } = load(result);
    setFeatureName(featureName);
    onLoad({ customerList, lineupList, pkgList, versionList });
  };

  return (
    <>
      <Menu mode="horizontal" selectable={false}>
        <Menu.Item key="new" onClick={onNew}>
          <FileOutlined />
        </Menu.Item>
        <Menu.Item key="load" onClick={() => refLoad.current?.click()}>
          <FolderOpenOutlined />
        </Menu.Item>
        <Menu.Item key="featureName" disabled>
          <Input
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
          />
        </Menu.Item>
        <Menu.Item key="save" onClick={() => onClickSave()}>
          <SaveOutlined />
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
