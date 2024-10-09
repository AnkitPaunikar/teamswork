import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "",
});

const { RoomProvider, useRoom, useOthers, useMyPresence } =
  createRoomContext(client);

export { RoomProvider, useRoom, useOthers, useMyPresence };
