import { publish } from "../utils";

describe("Enahncement should appear at most one time", () => {
  test("Global and then targeted", () => {
    const globalAndTargeted = {
      versionList: [
        {
          index: 0,
          name: "version 1",
          indexPrev: -1,
          changeList: [
            {
              index: 0,
              description: "change a",
              beforeChange: "before change",
              afterChange: "after change",
              lineupIndex: -1,
            },
          ],
          releaseList: [
            {
              index: 0,
              pkgIndex: 0,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [-1],
                },
              ],
            },
            {
              index: 1,
              pkgIndex: 1,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [0],
                },
              ],
            },
          ],
        },
      ],
      lineupList: [],
      pkgList: [
        {
          index: 0,
          name: "package a",
          lineupIndex: -1,
        },
        {
          index: 1,
          name: "package b",
          lineupIndex: -1,
        },
      ],
      customerList: [
        {
          index: 0,
          name: "customer a",
        },
      ],
    };
    const { versionList, lineupList, pkgList, customerList } =
      globalAndTargeted;
    const publishResult = publish(
      versionList,
      0,
      lineupList,
      pkgList,
      customerList
    );
    expect(publishResult).toBe(`<customer a>
        package a
            - Initial release
</customer a>`);
  });

  test("Targeted and then targeted", () => {
    const globalAndTargeted = {
      versionList: [
        {
          index: 0,
          name: "version 1",
          indexPrev: -1,
          changeList: [
            {
              index: 0,
              description: "change a",
              beforeChange: "before change",
              afterChange: "after change",
              lineupIndex: -1,
            },
          ],
          releaseList: [
            {
              index: 0,
              pkgIndex: 0,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [0],
                },
              ],
            },
            {
              index: 1,
              pkgIndex: 1,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [0],
                },
              ],
            },
          ],
        },
      ],
      lineupList: [],
      pkgList: [
        {
          index: 0,
          name: "package a",
          lineupIndex: -1,
        },
        {
          index: 1,
          name: "package b",
          lineupIndex: -1,
        },
      ],
      customerList: [
        {
          index: 0,
          name: "customer a",
        },
      ],
    };
    const { versionList, lineupList, pkgList, customerList } =
      globalAndTargeted;
    const publishResult = publish(
      versionList,
      0,
      lineupList,
      pkgList,
      customerList
    );
    expect(publishResult).toBe(`<customer a>
        package a
            - Initial release
</customer a>`);
  });

  test("Targeted and then global", () => {
    const globalAndTargeted = {
      versionList: [
        {
          index: 0,
          name: "version 1",
          indexPrev: -1,
          changeList: [
            {
              index: 0,
              description: "change a",
              beforeChange: "before change",
              afterChange: "after change",
              lineupIndex: -1,
            },
          ],
          releaseList: [
            {
              index: 0,
              pkgIndex: 0,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [0],
                },
              ],
            },
            {
              index: 1,
              pkgIndex: 1,
              customerIndexList: [0],
              customerIndexListPerChangeList: [
                {
                  versionIndex: 0,
                  changeIndex: 0,
                  customerIndexList: [-1],
                },
              ],
            },
          ],
        },
      ],
      lineupList: [],
      pkgList: [
        {
          index: 0,
          name: "package a",
          lineupIndex: -1,
        },
        {
          index: 1,
          name: "package b",
          lineupIndex: -1,
        },
      ],
      customerList: [
        {
          index: 0,
          name: "customer a",
        },
      ],
    };
    const { versionList, lineupList, pkgList, customerList } =
      globalAndTargeted;
    const publishResult = publish(
      versionList,
      0,
      lineupList,
      pkgList,
      customerList
    );
    expect(publishResult).toBe(`<customer a>
        package a
            - Initial release
</customer a>`);
  });
});
