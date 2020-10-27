import { derived, Readable } from "svelte/store";

import * as project from "./project";
import * as remote from "./remote";
import * as waitingRoom from "./waitingRoom";

// TYPES
interface Following {
  follows: project.Project[];
  requests: waitingRoom.ProjectRequest[];
}

// STATE
const followingProjectsStore = remote.createStore<project.Project[]>();
export const followingProjects = followingProjectsStore.readable;

const requestedProjectsStore = remote.createStore<
  waitingRoom.ProjectRequest[]
>();
export const requestedProjects = requestedProjectsStore.readable;

export const following: Readable<remote.Data<Following | null>> = derived(
  [followingProjectsStore, requestedProjectsStore],
  ([follows, requests]) => {
    // Transition to loading.
    if (
      follows.status === remote.Status.Loading ||
      requests.status === remote.Status.Loading
    ) {
      return { status: remote.Status.Loading };
    }

    // Return errors.
    if (follows.status === remote.Status.Error) {
      return follows;
    }
    if (requests.status === remote.Status.Error) {
      return requests;
    }

    // Data loaded.
    if (
      follows.status === remote.Status.Success &&
      requests.status === remote.Status.Success
    ) {
      let data = null;
      if (follows.data.length > 0 || requests.data.length > 0) {
        data = { follows: follows.data, requests: requests.data };
      }
      return { status: remote.Status.Success, data };
    }

    return { status: remote.Status.NotAsked };
  }
);

// ACTIONS
export const fetchFollowing = (): void => {
  remote.fetch(followingProjectsStore, project.fetchTracking());
  remote.fetch(requestedProjectsStore, project.fetchSearching(), reqs => {
    return reqs.filter(req => req.type !== waitingRoom.Status.Cloned);
  });
};