// Copyright © 2021 The Radicle Upstream Contributors
//
// This file is part of radicle-upstream, distributed under the GPLv3
// with Radicle Linking Exception. For full terms see the included
// LICENSE file.

module.exports = {
  roots: ["<rootDir>/ui/src", "<rootDir>/native"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^ui/(.*)$": "<rootDir>/ui/$1",
    "^proxy-client/(.*)$": "<rootDir>/proxy-client/$1",
    "^proxy-client$": "<rootDir>/proxy-client/index",
    "^design-system/(.*)$": "<rootDir>/design-system/$1",
    "^design-system$": "<rootDir>/design-system/index",
  },
  testEnvironment: "jsdom",
  testRegex: "(/__tests__/.*|(\\.|/)(test))\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
};
