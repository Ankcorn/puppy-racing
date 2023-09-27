import type * as Party from "partykit/server";

type Event = { type: "CONNECT" | "DISCONNECT", data: Puppy }
type Puppy = { puppy: number, user: string };

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}
  puppies: Puppy[] = [];
  async onStart() {
    this.puppies = (await this.party.storage.get<Puppy[]>("puppies")) ?? [];
  }
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // let's send a message to the connection
    conn.send(JSON.stringify(this.puppies));
  }

  async onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    const event = JSON.parse(message) as Event;
    if(event.type === "CONNECT") {
      if(this.puppies.find(pup => pup.puppy === event.data.puppy)) return;

      this.puppies.push(event.data)
    } else {
      this.puppies = this.puppies.filter(el => el.puppy === event.data.puppy)
    }

    await this.party.storage.put(`puppies`, this.puppies)
    
    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      JSON.stringify(this.puppies)
    );
  }
}

Server satisfies Party.Worker;
