import RegisterForm from "../../components/RegisterForm"

export default function Register() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-skyblue">Registro</h1>
        <RegisterForm />
      </div>
    </main>
  )
}

