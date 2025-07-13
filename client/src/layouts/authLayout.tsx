import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/api/auth";
import { useUserStore } from "@/stores/useUserStore";

export const AuthInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const setUser = useUserStore((s) => s.setUser);
  const setIsLoading = useUserStore((s) => s.setIsLoading);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (data) setUser(data);
    if (error) setUser(null); // optional
  }, [data, error]);

  return <>{children}</>;
};
