import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

interface MessageResponseDTO {
  id: string;
  message: string;
  createdAt: string;
  user: MessageUserResponseDTO;
}

interface MessageUserResponseDTO {
  id: string;
  username: string;
}

function App() {
  const [messages, setMessages] = useState<MessageResponseDTO[]>([]);

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("✅ WebSocket conectado");

      client.subscribe("/topic/rooms/d292c92f-feee-4b7b-acd7-e3a14f3e35c3", (message) => {
        console.log("Mensagem recebida:", message.body);

        const payload: MessageResponseDTO =
            JSON.parse(message.body);

        setMessages((previous) => [
          ...previous,
          payload,
        ]);
      });
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP ERROR");
      console.error(frame);
    };

    client.onWebSocketError = (event) => {
      console.error("❌ WEBSOCKET ERROR");
      console.error(event);
    };

    client.onWebSocketClose = (event) => {
      console.error("❌ WEBSOCKET CLOSED");
      console.error(event);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(
            "http://localhost:8080/messages/d292c92f-feee-4b7b-acd7-e3a14f3e35c3",
            {
              headers: {
                Authorization: `Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0aGF1YSIsInVzZXJJZCI6ImIzODQ1OTdkLWQwNTgtNDIwNi1hNzUwLWRhYjU2MzBkZTRkNyIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE3ODE0NDgxNDksImV4cCI6MTc4MTUzNDU0OX0.hEx247cUvSVCod-rgHTBY-I2H_izsWcERoo1a7iP1_b8cDewJcv3Fk9KHtDWNphMzyjj83IBnxVQAMEWF_1l7lfBVQNTN2l30xbM-eC6EMKIRVoE1pD7hh6YADOylC8q18MDzAtXsyeOGA25kZxXjLFnwFV0fzkFlD9O5f3b3r-F4J3OtYeCvZL8vtSsOVDnd1SDjm980gD7EtgUgFzvJtgTpss8uBWbd5b7vmiP8IXhvLMBn1Wvwpi2dQ-xp-g66Ec82hymjllMnVMkES-zLq5BNnlB29LMcx52o_ZTt9vJdU68Q1hDwZ6d-S2tc4w6M_S39raDPVzCLnxvFzbtCA`,
              },
            }
        );

        const data: MessageResponseDTO[] =
            await response.json();

        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadMessages();
  }, []);

  return (
      <>
        <h1>Mensagens</h1>

        {messages.map((message) => (
            <div key={message.id}>
              <h3>{message.user.username}</h3>
              <p>{message.message}</p>
            </div>
        ))}
      </>
  );
}

export default App;