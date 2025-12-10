import { getServerSession } from "next-auth";
import type { UserIdentity } from "@/lib/curriculum/progress-service";
import { authOptions } from "@/lib/auth";

export const getSessionUser = async (): Promise<UserIdentity | null> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};
