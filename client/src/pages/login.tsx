import React from "react";

export default function Login(): React.ReactElement {
  function login() {
    window.location.href = "http://localhost:5000/auth/google";
  }

  return (
    <div>
      <button onClick={login}>Login with google</button>
    </div>
  );
}
