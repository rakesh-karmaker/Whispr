export default function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center">
      <h1 className="text-2xl font-medium">Hello Welcome to Whispr</h1>
      <a href="/auth/login" className="text-blue-500 hover:underline text-lg">
        Login
      </a>
    </div>
  );
}
