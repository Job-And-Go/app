'use client'

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";


export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return ( <div>Logged in</div> );
}
