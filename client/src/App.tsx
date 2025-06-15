import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Session } from "@supabase/supabase-js";
import "./App.css";

function App() {
  // const [session, setSession] = useState<Session | null>(null);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // console.log(session);

  // function signin() {
  //   supabase.auth
  //     .signInWithOAuth({
  //       provider: "google",
  //     })
  //     .catch((err) => {
  //       console.error("OAuth error:", err);
  //     });
  // }

  // function signout() {
  //   supabase.auth.signOut();
  // }

  // if (!session) {
  //   return (
  //     <>
  //       <button onClick={signin}>Sign in with Google</button>
  //     </>
  //   );
  // } else {
  //   return (
  //     <>
  //       <p></p>
  //       <button onClick={signout}>Sing out</button>
  //     </>
  //   );
  // }

  return <>Hello</>;
}

export default App;
