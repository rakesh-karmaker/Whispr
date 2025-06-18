import React from "react";

// const serverURL = import.meta.env.VITE_SERVER_URL as string;

export default function Login(): React.ReactElement {
  // function login() {
  //   window.location.href = "http://localhost:5000/auth/google";
  // }

  // function loginWithPopup() {
  //   const popup = window.open(
  //     `${serverURL}/auth/google/`, // new route
  //     "Google Login",
  //     "width=500,height=600"
  //   );

  //   // Listen for message from popup
  //   window.addEventListener("message", (event) => {
  //     if (event.origin !== serverURL) return; // important for security

  //     const userId = event.data.user;
  //     console.log(userId);
  //     // if (userId) {
  //     //   window.location.href = `/profile-select?id=${userId}`;
  //     // }
  //   });
  // }

  return (
    <div>
      <button>Login with google</button>
    </div>
  );
}
