"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/header";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ws, isConnected, sendMessage } = useWebSocket();
  const user = useSelector((state: RootState) => state.user);
  const [customText,setCustomText] = useState<string>("");


  // Retrieve query parameters
  const acct1 = searchParams.get("acct1");
  const token1 = searchParams.get("token1");
  const cur1 = searchParams.get("cur1");
  const acct2 = searchParams.get("acct2");
  const token2 = searchParams.get("token2");
  const cur2 = searchParams.get("cur2");

  useEffect(() => {
    // Check if query parameters exist
    if (acct1 && token1 && cur1 && acct2 && token2 && cur2) {
      // Establish the connection using these parameters
      // establishConnection({
      //   acct1,
      //   token1,
      //   cur1,
      //   acct2,
      //   token2,
      //   cur2,
      // });
      console.log(token1);
      console.log(token2);
      setCustomText("Email");

    } else {
      console.log(user.is_virtual, user.balance,user.currency,user.fullname,user.email);
      
       console.log("User logged in with API token. No connection setup needed.");
       setCustomText("Api Token");

    }
  }, [acct1, token1, cur1, acct2, token2, cur2]);

  return (
    // <div>
    //   {/* Header Component */}
    //   {/* <Header /> */}

    //   <h1>Dashboard</h1>
    //   <h2>Account Details</h2>
    //   {acct1 && token1 && cur1 && acct2 && token2 && cur2 ? (
    //     <div>
    //       <div>
    //         <p>
    //           <strong>Real Account:</strong> {acct1} - {cur1}
    //         </p>
    //         <p>
    //           <strong>Real Token:</strong> {token1}
    //         </p>
    //       </div>
    //       <div>
    //         <p>
    //           <strong>Virtual Account:</strong> {acct2} - {cur2}
    //         </p>
    //         <p>
    //           <strong>Virtual Token:</strong> {token2}
    //         </p>
    //       </div>
    //     </div>
    //   ) : (
    //     <p>
    //       <strong>Logged in with API token. No account details available.</strong>
    //     </p>
    //   )}
    // </div>
    <div>
      <h1>Wel come!</h1>
      <h2>You have logged with {customText}</h2>
    </div>
  );
}

// Function to establish the connection
// const establishConnection = (params: {
//   acct1: string;
//   token1: string;
//   cur1: string;
//   acct2: string;
//   token2: string;
//   cur2: string;
// }) => {
//   console.log("Establishing connection with the following parameters:", params);

//   // Example API call or connection setup
//   fetch("/api/connect", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(params),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Connection established:", data);
//     })
//     .catch((error) => {
//       console.error("Error establishing connection:", error);
//     });
// };
