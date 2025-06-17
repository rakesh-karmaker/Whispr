import React from "react";

export default function Login(): React.ReactElement {
  // function login() {
  //   window.location.href = "http://localhost:5000/auth/google";
  // }

  function loginWithPopup() {
    const popup = window.open(
      "http://localhost:5000/auth/google/", // new route
      "Google Login",
      "width=500,height=600"
    );

    // Listen for message from popup
    window.addEventListener("message", (event) => {
      if (event.origin !== "http://localhost:5000") return; // important for security

      const userId = event.data.id;
      console.log(userId);
      if (userId) {
        window.location.href = `/profile-select?id=${userId}`;
      }
    });
  }

  return (
    <div>
      <button onClick={loginWithPopup}>Login with google</button>
    </div>
  );
}
