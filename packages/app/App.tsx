import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import usePartySocket from "partysocket/react";
import { ReactNode, useEffect, useState } from 'react';

type Puppy = { puppy: Number };

export default function App(): ReactNode {
  const [puppies, setPuppies] = useState<Puppy[]>([])
  const [connected, setConnected] = useState<boolean>(false)
  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: "localhost:1999", // or localhost:1999 in dev
    room: "my-room",

    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {

      console.log("connected");
    },
    onMessage(e) {
      console.log("message", e.data);
      const puppies = JSON.parse(e.data)
      setPuppies(puppies)
    },
    onClose() {
      console.log("closed");
    },
    onError(e) {
      console.log("error");
    },
  });

  useEffect(() => {
    const onBeforeUnload = (ev) => {
      ws.send(JSON.stringify({ type: "DISCONNECT", data: { puppy: puppies.length + 1 } }))
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Puppy Racing!</Text>
      <Button disabled={connected} title="connect" onPress={() => {
        ws.send(JSON.stringify({ type: "CONNECT", data: { puppy: puppies.length + 1 } }))
        setConnected(true)
      }}></Button>
      <View style={styles.track}>
        {puppies.map(el => (<Text>Puppy {el.puppy.toString()}</Text>))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: '#B56576',
    width: '100%'
  }
});
