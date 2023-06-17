import { TResListViewDevices } from "../types/templateResponse.ts";

export const formatDate = (data: TResListViewDevices) => {
  const TAG = "formatDate";
  console.log(`--> ${TAG} has been called`);
  let INDEX_PLAYERS = 0;
  const editDataPlayers: TResListViewDevices = data;

  do {
    editDataPlayers.players[INDEX_PLAYERS].created_at = new Date(
      editDataPlayers.players[INDEX_PLAYERS].created_at as number * 1000,
    ).toDateString();
    editDataPlayers.players[INDEX_PLAYERS].last_active = new Date(
      editDataPlayers.players[INDEX_PLAYERS].last_active as number * 1000,
    ).toDateString();
    INDEX_PLAYERS = INDEX_PLAYERS + 1;
  } while (INDEX_PLAYERS < data.players.length);

  console.log(`--> ${TAG} has been ended`);
  return editDataPlayers;
};
