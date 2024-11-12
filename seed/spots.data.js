export const spotsData = [
  {
    _id: {
      $oid: "67335979451909293ded1c65",
    },
    name: "World Trade Center",
    location: {
      type: "Point",
      coordinates: [-74.010843, 40.710744],
    },
    address:
      "Two World Trade Center, 200 Greenwich St, New York City, New York 10007, United States",
    description:
      "The World Trade Center is a place that must be visited. It's great for panoramic city photos that are breathtaking.",
    accessibility:
      "Although the grounds are free to be accessed without any charge, visiting the observatory does require an admission fee. The WTC is very accessible and accommodates public transportation, allows wheelchair access (even has wheel chairs for rent), allows service animals.",
    bestTimes: ["sunset", "early morning", "after sunset", "nighttime"],
    images: [
      {
        public_id: "ecpy9jwxkghee9ngnhhy",
        url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731418483/ecpy9jwxkghee9ngnhhy.jpg",
      },
    ],
    tags: ["skyscraper", "nyc", "photography"],
    posterId: {
      $oid: "507f191e810c19729de860ea",
    },
    createdAt: new Date("2024-11-12T13:34:49.053Z"),
    reportCount: 0,
  },
  {
    _id: {
      $oid: "67335d41451909293ded1c66",
    },
    name: "Grand Central Terminal",
    location: {
      type: "Point",
      coordinates: [-73.977362, 40.752467],
    },
    address:
      "Grand Central Terminal, 87 E 42nd St, New York City, New York 10017, United States",
    description:
      "Besides being a major transportation hub, the Grand Central Terminal is an iconic photography spot with great architecture and history. In addition to all the opportunity for photography it provides, there are also a lot of places to shop and to eat!",
    accessibility:
      "Due to being a transportation hub, the Grand Central Terminal is highly accessible. It has ramps, elevators, escalators, wheelchair access, and audiovisual passenger information systems. Moreover, the station is open and free to access.",
    bestTimes: ["non-rush hours", "weekends"],
    images: [
      {
        public_id: "fhaoqxqecfmwofjtfgqk",
        url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419325/fhaoqxqecfmwofjtfgqk.jpg",
      },
      {
        public_id: "d0lwskdj0yzpzwdkza7d",
        url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419448/d0lwskdj0yzpzwdkza7d.jpg",
      },
    ],
    tags: ["architecture", "transportation", "station", "nyc"],
    posterId: {
      $oid: "507f191e810c19729de860ea",
    },
    createdAt: new Date("2024-11-12T13:50:57.450Z"),
    reportCount: 0,
  },
];
