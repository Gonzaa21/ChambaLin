"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function loadSession() {
          const { data, error } = await supabase.auth.getSession();

          if (mounted) {
            setUser(error ? null : data.session?.user ?? null);
            setLoading(false);
          }
        }

        loadSession();
        
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
              setUser(session?.user ?? null);
              setLoading(false);
            }
        });
      
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    },  []);

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
    }

    return { user, loading, signOut };
}
