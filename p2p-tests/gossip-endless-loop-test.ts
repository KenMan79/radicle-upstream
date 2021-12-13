#!/usr/bin/env -S node --require ts-node/register/transpile-only --require tsconfig-paths/register

// Copyright © 2021 The Radicle Upstream Contributors
//
// This file is part of radicle-upstream, distributed under the GPLv3
// with Radicle Linking Exception. For full terms see the included
// LICENSE file.

import * as path from "path";
import { strict as strictAssert } from "assert";

import { sleep } from "ui/src/sleep";
import {
  RadicleProxy,
  UpstreamSeed,
  radCli,
  runTestcase,
  withRetry,
} from "./lib/p2p";

async function testcase(dataPath: string) {
  const project = {
    name: "my-fancy-project",
    urn: "rad:git:hnrkrhhs1goaawo7db1gpyct8hd7mif5q8c3o",
  };

  const seed = new UpstreamSeed({
    name: "seed",
    ipAddress: "10.0.0.1",
    project: project.urn,
    dataPath,
  });

  const maintainer = new RadicleProxy({
    name: "maintainer",
    ipAddress: "10.0.0.101",
    seed: seed.seedAddress,
    dataPath,
  });

  const contributor = new RadicleProxy({
    name: "contributor",
    ipAddress: "10.0.0.102",
    seed: seed.seedAddress,
    dataPath,
  });

  const contributor2 = new RadicleProxy({
    name: "contributor2",
    ipAddress: "10.0.0.103",
    seed: seed.seedAddress,
    dataPath,
  });

  const contributor3 = new RadicleProxy({
    name: "contributor3",
    ipAddress: "10.0.0.104",
    seed: seed.seedAddress,
    dataPath,
  });

  const contributor4 = new RadicleProxy({
    name: "contributor4",
    ipAddress: "10.0.0.105",
    seed: seed.seedAddress,
    dataPath,
  });

  seed.start();
  maintainer.start();
  contributor.start();
  contributor2.start();
  contributor3.start();
  contributor4.start();

  await sleep(2000);

  // Maintainer creates a new project.
  await withRetry(async () => {
    await maintainer.proxyClient.project.create({
      repo: {
        type: "new",
        path: maintainer.checkoutPath,
        name: project.name,
      },
      description: "",
      defaultBranch: "main",
    });
  });

  // Assert that the seed received the project.
  await withRetry(async () => {
    const result = radCli({
      radHome: seed.radHome,
      args: ["identities", "project", "get", "--urn", project.urn],
    });

    strictAssert.deepStrictEqual(result, {
      urn: project.urn,
      payload: {
        "https://radicle.xyz/link/identities/project/v1": {
          name: "my-fancy-project",
          description: "",
          default_branch: "main",
        },
      },
    });
  });

  // Contributor follows the project.
  await withRetry(async () => {
    await contributor.proxyClient.project.requestSubmit(project.urn);
  });

  // Contributor2 follows the project.
  await withRetry(async () => {
    await contributor2.proxyClient.project.requestSubmit(project.urn);
  });

  // Contributor3 follows the project.
  await withRetry(async () => {
    await contributor3.proxyClient.project.requestSubmit(project.urn);
  });

  // Contributor4 follows the project.
  await withRetry(async () => {
    await contributor4.proxyClient.project.requestSubmit(project.urn);
  });

  await sleep(60000);
}

runTestcase({
  testcase,
  networkScript: "mesh-topology.sh",
  dataDirName: path.basename(__filename).replace(".ts", ""),
});
