export type Change = {
  index: number;
  description: string;
  beforeChange: string;
  afterChange: string;
  customerIndexList: number[];
}

export type Enum = {
  index: number;
  name: string;
};

export type Pkg = {
  index: number;
  name: string;
  lineupIndex: number;
};

export type Release = {
  index: number;
  pkgIndex: number;
  customerIndexList: number[];
}

export type Version = {
  index: number;
  name: string;
  indexPrev: number;
  changeList: Change[];
  releaseList: Release[];
};
