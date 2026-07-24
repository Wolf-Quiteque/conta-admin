import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/dal";

export default async function Home() {
  const session = await getOptionalSession();
  redirect(
    session?.userId && session.role === "admin" ? "/utilizadores" : "/entrar",
  );
}
